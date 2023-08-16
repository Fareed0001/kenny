const jwt = require('jsonwebtoken');
require("dotenv").config();

class AuthMiddleWares {

  adminMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const arrayAuth = authHeader.split(' ');
    if (arrayAuth.length != 2 || arrayAuth[0] != 'Bearer') {
        return res.status(401).json({ error: 'The provided token is invalid' }
        );
    }

    const token = arrayAuth[1];
    req.bearerToken = token;
    // return next();
    jwt.verify(token, process.env.JWT_ADMIN_SECRET, (err, decoded) => {
        if (err){
            let error;
            switch(err.name){
                case 'TokenExpiredError':
                    error = 'Expired token';
                    break;
                default:
                    error = 'Invalid token';
                    break;
            }
            return res.status(403).json(
                {
                    status:'failed',
                    message: 'Unauthorized.',
                   // error
                }
            )
        }
        //req.bearerToken = token;
        //req.tokenInfo = decoded;
        req.auth_id = decoded.uid;
        //req.auth_role = decoded.role;
        next();
    });


  }

  agentMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const arrayAuth = authHeader.split(' ');
    if (arrayAuth.length != 2 || arrayAuth[0] != 'Bearer') {
        return res.status(401).json({ error: 'The provided token is invalid' }
        );
    }

    const token = arrayAuth[1];
    req.bearerToken = token;
    // return next();
    jwt.verify(token, process.env.JWT_TUTOR_SECRET, (err, decoded) => {
        if (err){
            let error;
            switch(err.name){
                case 'TokenExpiredError':
                    error = 'Expired token';
                    break;
                default:
                    error = 'Invalid token';
                    break;
            }
            return res.status(400).json({
                error
            })
        }

        //req.bearerToken = token;
        //req.tokenInfo = decoded;
        req.auth_id = decoded.uid;
        req.auth_role = decoded.role;
        next();
    });


  }

  studentMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const arrayAuth = authHeader.split(' ');
    if (arrayAuth.length != 2 || arrayAuth[0] != 'Bearer') {
        return res.status(401).json({ error: 'The provided token is invalid' }
        );
    }
    const token = arrayAuth[1];
    req.bearerToken = token;
    // return next();
    jwt.verify(token, process.env.JWT_STUDENT_SECRET, (err, decoded) => {
        if (err){
            let error;
            switch(err.name){
                case 'TokenExpiredError':
                    error = 'Expired token';
                    break;
                default:
                    error = 'Invalid token';
                    break;
            }
            return res.status(400).json({
                error
            })
        }
        //req.bearerToken = token;
        //req.tokenInfo = decoded;
        req.auth_id = decoded.uid;
        req.auth_role = decoded.role;
        next();
    });
  }
  
  instructorMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const arrayAuth = authHeader.split(' ');
    if (arrayAuth.length != 2 || arrayAuth[0] != 'Bearer') {
        return res.status(401).json({ error: 'The provided token is invalid' }
        );
    }
    const token = arrayAuth[1];
    req.bearerToken = token;
    // return next();
    jwt.verify(token, process.env.JWT_INSTRUCTOR_SECRET, (err, decoded) => {
        if (err){
            let error;
            switch(err.name){
                case 'TokenExpiredError':
                    error = 'Expired token';
                    break;
                default:
                    error = 'Invalid token';
                    break;
            }
            return res.status(400).json({
                error
            })
        }
        //req.bearerToken = token;
        //req.tokenInfo = decoded;
        req.auth_id = decoded.uid;
        //req.auth_role = decoded.role;
        next();
    });
  }
}

module.exports = new AuthMiddleWares();
