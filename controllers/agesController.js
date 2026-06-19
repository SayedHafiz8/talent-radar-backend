import asyncHandler from "express-async-handler";

import AgeGroup from "../models/ageGroupModel.js";
import { creating, gettingAll, gettingSpecific } from "../services/services.js";

// @desc    Create new AgeGroup
// @route   POST api/v1/ages
// @access  private
export const create = creating(AgeGroup); 

// @desc    Get all age groups
// @route   POST api/v1/ages
// @access  private
export const getAll = gettingAll(AgeGroup);

// @desc    Get specific age 
// @route   POST api/v1/ages/:id
// @access  private
export const getSpecific = gettingSpecific(AgeGroup);