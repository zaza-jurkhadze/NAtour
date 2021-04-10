const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Console } = require('console');

//name, email,  password, confirmPassword
const userScima = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'please tell us your name']
    },
    email: { 
        type: String,
        required: [true, 'please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide your email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum:['user', 'guid', 'lead-guid', 'admin'],
        default: 'user'
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            validator: function(el){
                return el === this.password;
            },
            message: 'passwords are not the same'
        }
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

userScima.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

userScima.methods.changepasswordAfter = function(jwtTimeStep){
    if(this.passwordChangeAt){
        const changeTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
        console.log(changeTimestamp, jwtTimeStep);
        return jwtTimeStep < changeTimestamp
    }
    return false;
}  
userScima.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    
   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
   console.log(resetToken, this.passwordResetToken);
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

   return resetToken;
};

userScima.pre('save', function(next){
    if(this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000;

    next();
});

userScima.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User', userScima);

module.exports = User;