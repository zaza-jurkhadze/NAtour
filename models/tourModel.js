const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [30, 'a tour must have less or equal than 30 characters'],
        minlength: [10, 'a tour must have more or equal than 10 characters']
        //validate: [validator.isAlpha, 'a tour name must be only alphabet symbols!']
    },
    slug: String,
    duration: {
        type: Number, 
        required:[true, 'a tour must have a duration!']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 's tour must have a group size!']
    },
    difficulty: {
        type: String,
        required: 'a tour must have a difficulty!',
        enum: {
            values:['easy','medium','difficult'],
            message: 'difficulty is either easy,medium,difficult'
        }
        },

   ratingsAverage:  {
        type: Number,
        default: 4.5,
        min: [1, 'a tour rating must be above 1.0'],
        max: [5, 'a tour rating must be below 5.0']

    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'a tour must have a price']
    },
    priceDiscount:{
        type: Number,
        validate: {
            validator: function(val){
                return val < this.price;
            },
            message: 'discount price({VALUE}) should be below regular price'
        }
    }, 
    summary: {
        type: String,
        trim: true,
        required:[true, 'a tour must have a summary!']
    },
     
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'a tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},{
    toJSON:{virtuals:true},
    toObject: {virtuals:true}
});
    tourSchema.virtual('durationWeeks').get(function(){
            return this.duration / 7
    });
        tourSchema.pre('save', function(next){
            this.slug = slugify(this.name,{lower:true})
            next();
        });
        tourSchema.pre('save', function(next){
            this.slug = slugify(this.name,{lower:true})
            next();
        });
        tourSchema.pre(/^find/, function(next){
            this.find({secretTour: {$ne: true}});
            this.start = Date.now();
            next();
        });
        tourSchema.post(/^find/, function(docs, next){
            console.log(`query took ${Date.now() - this.start} milliseconds!`)
            //console.log(docs);
            next();
        });
        tourSchema.pre('aggregate', function(next){
            console.log(`query took ${Date.now() - this.start} milliseconds!`)
            this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
            //console.log(docs);
            next();
        });
const tour = mongoose.model('TOURS',tourSchema);

module.exports = tour;

