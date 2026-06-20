import asyncHandler from "express-async-handler";

import Player from "../models/playedModel.js";
import { creating, deleteOne, gettingAll, gettingSpecific, updating } from "../services/services.js";



export const setUserIdToBody = (req, res, next) => {
    // Nested Router
    if(!req.body.coach) req.body.coach = req.params.id;
    next();
}

// @desc    Create new AgeGroup
// @route   POST api/v1/ages
// @access  private
export const create = creating(Player, "coach"); 

// @desc    Get all age groups
// @route   POST api/v1/ages
// @access  private
export const getAll = gettingAll(Player, "coach", ["name", "position", "preferredFoot", "nationality", "city"]);

// @desc    Get specific age 
// @route   POST api/v1/ages/:id
// @access  private
export const getSpecific = gettingSpecific(Player);

// @desc    Get specific age 
// @route   POST api/v1/ages/:id
// @access  private
export const deleting = deleteOne(Player);

//@desc    Get specific age 
// @route   POST api/v1/ages/:id
// @access  private
export const update = updating(Player);