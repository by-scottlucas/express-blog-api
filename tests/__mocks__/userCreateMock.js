const UserCreateMock = {
    save: jest.fn().mockResolvedValue({
        _id: "60b6c2f5f7d7f60412f1b9e1",
        name: "Lucas",
        email: "lucas@email.com",
        password: "lucas123"
    },),
};

export default UserCreateMock;
