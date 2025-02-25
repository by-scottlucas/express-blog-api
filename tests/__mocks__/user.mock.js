const UserMock = {
    save: jest.fn().mockResolvedValue({
        _id: "67bcd1dea2ee4dee4d8c8ddb",
        name: "Usuário Exemplo",
        email: "usuario@exemplo.com"
    }),
    findById: jest.fn().mockResolvedValue({
        _id: "67bcd1dea2ee4dee4d8c8ddb",
        name: "Usuário Exemplo",
        email: "usuario@exemplo.com"
    })
};

export default UserMock;