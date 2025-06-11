const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');

exports.getLocations = async(req,res,next) => {
    console.log("Enter get all locations");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }
    

    try{
      let filters = {
        'host_email': { $ne: req.params.email},
        'mode': req.body.mode
      };

      if (req.body.coords) {
        filters = {...filters, coords: {
          $near : {
            $geometry: {type: "Point", coordinates: req.body.coords},
            $maxDistance: req.body.max_dist ? (req.body.max_dist * 1000) : 5000
          }
        }}
      }

      if(req.body.start && req.body.end) {
        console.log("Start" + req.body.start);
        console.log("ENd " + req.body.end)
        filters = {...filters,
          unavailableDates: {$not: {$elemMatch: {
            $or: [
              { from: {$gte: req.body.start, $lte: req.body.end}},
              { to: {$gte: req.body.start, $lte: req.body.end}},
              {$and: [
                {from: {$lte: req.body.start}},
                {to: {$gte: req.body.end}}
              ]}
            ]
          }}}
        }
      }

      if (req.body?.search) {
        filters = {...filters, $text: { $search: req.body.search}}
      }

      if (req.body?.min_price) {
        filters = {...filters, price: {$gte: req.body.min_price}}
      }

      if (req.body?.max_price) {
        filters = {...filters, price: {$lte: req.body.max_price}}
      }

      if (req.body?.min_rooms) {
        filters = {...filters, rooms: {$gte: req.body.min_rooms}}
      }

      if (req.body?.min_baths) {
        filters = {...filters, baths: {$gte: req.body.min_baths}}
      }

      if (req.body?.adults) {
        filters = {...filters, adults: {$gte: req.body.adults}}
      }

      if (req.body?.kids) {
        filters = {...filters, kids: {$gte: req.body.kids}}
      }

      if(req.body?.facilities?.AC) {
        filters = {...filters, "facilities.AC": true}
      }

      if(req.body?.facilities?.kitchen) {
        filters = {...filters, "facilities.kitchen": true}
      }

      if(req.body?.facilities?.heat) {
        filters = {...filters, "facilities.heat": true}
      }

      if(req.body?.facilities?.wifi) {
        filters = {...filters, "facilities.wifi": true}
      }

      if(req.body?.facilities?.parking) {
        filters = {...filters, "facilities.parking": true}
      }

      if(req.body?.facilities?.balcony) {
        filters = {...filters, "facilities.balcony": true}
      }

      if(req.body?.facilities?.garden) {
        filters = {...filters, "facilities.garden": true}
      }

      if(req.body?.facilities?.pool) {
        filters = {...filters, "facilities.pool": true}
      }

      if('facilities' in req.body) {
        if (req.body?.facilities['hot tub'])
          filters = {...filters, "facilities.hot tub": true}
      }

      if(req.body?.facilities?.bbq) {
        filters = {...filters, "facilities.bbq": true}
      }

      if(req.body?.facilities?.bedroom) {
        filters = {...filters, "facilities.bedroom": true}
      }

      if(req.body?.facilities?.bathroom) {
        filters = {...filters, "facilities.bathroom": true}
      }

      if(req.body?.facilities?.sports) {
        filters = {...filters, "facilities.sports": true}
      }

      if(req.body?.facilities?.pets) {
        filters = {...filters, "facilities.pets": true}
      }

      if(req.body?.facilities?.wash) {
        filters = {...filters, "facilities.wash": true}
      }

      if(req.body?.furnished == "Yes") {
        filters = {...filters, furnished: "yes"}
      }

      if(req.body?.furnished == "No") {
        filters = {...filters, furnished: "no"}
      }

      if(req.body?.activated == true) {
        filters = {...filters, activated: true}
      }


      console.log(JSON.stringify(filters, null, 1));

      locationModel.find(filters, function (err, locations) {
        if(err) {
          console.log(err);
          return res.status(400).json({
            message: "Something happened"
          })
        }
        if(locations.length == 0) {
          return res.status(200).json({
                 message: "This user has no locations",
                 locations: []
            });
        }
        return res.status(201).json({
          message: "Locations returned",
          locations_count:  locations.length,
          locations
        });
      })
                        
    } catch(err){
        next(err);
    }
}