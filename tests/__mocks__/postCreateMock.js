const PostCreateMock = {
    save: jest.fn().mockResolvedValue({
        _id: "67bcd339a2ee4dee4d8c8dfb",
        author: "67bcd1dea2ee4dee4d8c8ddb",
        title: "Post 1",
        content: "Conteúdo do post 1",
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
    },)
};

export default PostCreateMock;
