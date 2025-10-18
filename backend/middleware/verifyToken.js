import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    console.log('Full Headers:', req.headers);
    console.log('Cookies:', req.cookies);

    const cookieToken = req.cookies.token;
    const headerToken = req.headers.authorization?.split(" ")[1];

    console.log('Cookie Token:', cookieToken);
    console.log('Header Token:', headerToken);

    const token = cookieToken || headerToken;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = { _id: decoded.id, role: decoded.role }; //Store role for admin checks
        next();
    } catch (error) {
        console.error('Token Verification Error:', error);

        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }

        // Handle invalid token format or other errors
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};