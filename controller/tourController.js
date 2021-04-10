//const fs = require('fs');
const AppError = require('../utils/appError');
const tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeature');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req,res,next) => {
     req.query.limit = '5';
     req.query.sort = 'price';
     req.query.fields = 'name,price,difficulty,summary';
     next();
}


exports.getAllTour = catchAsync(async (req, res,next) => {
  
    const features = new APIFeatures(tour.find(), req.query).filter().sort().limitFields().paginate();
    const tours = await features.query;
    res.status(200).json({
        status: "succes",
         results: tours.length,
        data: {
            tours
        } 
    });  
  
  
});

exports.getTour = catchAsync(async (req,res,next) => {
        
        const  Tour = await tour.findById(req.params.id);
    if(!Tour){
        return next(new AppError('not tour found with that ID', 404));
    };

        res.status(200).json({
            status: "succes",
                data: {
                    Tour
            }
         });
    });

exports.createTour = catchAsync(async (req,res,next) => {

    
        const newTour = await tour.create(req.body);
        res.status(201).json({
        status: "succes",
        data: {
                 tour: newTour
        } 
   });
 
}); 

exports.updateTour = catchAsync(async (req,res,next) => {
    
        const toures = await tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators:true
    });
    if(!toures){
        return next(new AppError('not tour found with that ID', 404));
    };

    res.status(200).json({
        status: "succes",
         data: {
            toures
        } 
    });
    
});

exports.deleteTour = catchAsync(async (req,res,next) => {
 const Tour = await tour.findByIdAndDelete(req.params.id);
  if(!Tour){
    return next(new AppError('not tour found with that ID', 404));
};
    res.status(204).json({
        status: "succes",
        data: null
    });
});


exports.getTourStats = catchAsync(async (req, res,next) => {
              const stats = await tour.aggregate([
                  {
                      $match: {ratingsAverage: {$gte: 4.5}}
                  },
                  {
                      $group: {
                          _id:{$toUpper:'$difficulty'},
                          num: {$sum: 1},
                          numDuration: {$sum: '$duration'},
                          avgRating: {$avg: '$ratingsAverage'},
                          avgPrice: {$avg: '$price'},
                          minPrice: {$avg: '$price'},
                          maxPrice: {$avg: '$price'}
                      }
                  },
                  {
                      $sort: {avgPrice: 1}
                  },
                  
         
              ]);

    res.status(200).json({
        status: "succes",
        data: {
           stats
        } 
    }); 
});



exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
              const year = req.params.year * 1;
              const plan = await tour.aggregate([
                  {
                      $unwind: '$startDates'
                  },
                  {
                      $match: {
                          startDates: {
                              $gte: new Date (`${year}-01-01`),
                              $lte: new Date (`${year}-12-31`)
                            }
                      }
                      
                  },
                
                  {
                      $group: {
                          _id:{$month: '$startDates'},
                          numTours: {$sum: 1},
                          tours: {$push: '$name'}
                      }
                  },
                  {
                      $addFields: {month: '$_id'}
                  },
                  {
                      $project: {
                          _id: 0
                      }
                  },
                  {
                      $sort: {numTours: 1}
                  },
                  {
                      $limit: 3
                  }
                 
         
              ]);

    res.status(200).json({
        status: "succes",
        data: {
          plan
        } 
    }); 
  
});

