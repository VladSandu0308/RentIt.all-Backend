const {validationResult} = require('express-validator');
const eventModel = require('../models/EventModel');

exports.createEvent = async(req, res, next) => {
    console.log("Enter create event");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const event = new eventModel(req.body);
        await event.save();
        
        return res.status(201).json({
            message: "Event created successfully!",
            event: event
        });
                        
    } catch(err){
        next(err);
    }
}

exports.getEvents = async(req, res, next) => {
    console.log("Enter get events");
    
    try{
        const events = await eventModel.find({ 
            status: 'active',
            end_date: { $gte: new Date() }
        }).sort({ start_date: 1 });

        return res.status(200).json({
            message: "Events retrieved successfully",
            events: events
        });
                        
    } catch(err){
        next(err);
    }
}

exports.updateEvent = async(req, res, next) => {
    console.log("Enter update event");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const event = await eventModel.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({
            message: "Event updated successfully!",
            event: event
        });
                        
    } catch(err){
        next(err);
    }
}

exports.deleteEvent = async(req, res, next) => {
    console.log("Enter delete event");
    
    try{
        await eventModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Event deleted successfully"
        });
                        
    } catch(err){
        next(err);
    }
}