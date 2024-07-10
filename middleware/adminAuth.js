const jwt = require('jsonwebtoken');

const checkJwt = (req, res, next) => {
    try {
        const tokenWithBearer = req.headers['authorization'];
        console.log(tokenWithBearer,'hkhkhkhkhk')
        if (tokenWithBearer) {
            const tokenOnly = tokenWithBearer.split(' ')[1];
            const verifyJwt = jwt.verify(tokenOnly, 'admin');
            console.log(verifyJwt,'hereeeeeeeeeeeeeeeeeeeeeee')
            // req.id = verifyJwt.user_id;
            next();
        } else {
            return res.status(401).send({ message: 'Authorization token not provided' });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send({ message: 'Invalid or expired token' });
    }
}

module.exports = {
    checkJwt
}
