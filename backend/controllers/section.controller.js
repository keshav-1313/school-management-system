import Section from "../models/section.model.js";
import Class from "../models/class.model.js";

// create section
export const createSection = async (req, res) => {
    try {
        const { sectionName, classId } = req.body;
        if (!sectionName || !classId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        const academicClass = await Class.findById(classId);
        if (!academicClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        // check if section already exists
        const existingSection = await Section.findOne({ sectionName, class: classId });
        if (existingSection) {
            return res.status(400).json({
                success: false,
                message: "Section already exists in this class",
            });
        }

        // create new section
        const newSection = await Section.create({ sectionName, class: classId });
        res.status(201).json({
            success: true,
            message: "Section created successfully",
            section: newSection,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get sections by class
export const getSectionsByClass = async (req, res) => {
    try {
        const sections = await Section.find({ class: req.params.classId }).populate("class");
        res.status(200).json({
            success: true,
            count: sections.length,
            sections,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// update section
export const updateSection = async (req, res) => {
    try {
        const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Section updated successfully",
            section,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// delete section
export const deleteSection = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }
        await section.deleteOne();
        res.status(200).json({
            success: true,
            message: "Section deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
