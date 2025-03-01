import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    // Verifica se o token está ausente ou mal formatado
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).send('Token não fornecido');
    }

    const jwtToken = token.split(' ')[1];  // Extrai o token

    try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);  // Verifica o token
        req.user = decoded;  // Armazena o usuário decodificado na requisição
        next();  // Continua para o próximo middleware ou rota
    } catch (err) {
        return res.status(401).send('Token inválido');  // Retorna erro 401 se o token for inválido
    }
};

export default authMiddleware;
