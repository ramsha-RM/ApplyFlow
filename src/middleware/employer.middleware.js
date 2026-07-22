export const employerOnly = async (req, res, next) => {
    try {
        if (req.user.role !== "employer") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Employers only.",
            });
        }
        next();
    } catch (error) {
        console.error("Employer middleware error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};