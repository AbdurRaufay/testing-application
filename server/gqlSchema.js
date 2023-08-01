const { gql } = require("apollo-server");
const typeDefs = gql`
type Query {
  users: [User]
  user(userId: ID!): User
  todos: [Todo]
  todo(todoId:ID!):Todo
  cartItems(userId: ID!): [CartItem]
  cartItemById(cartItemId: ID!): CartItem
}
type CartItem {
  id: ID!
  productId: ID!
  quantity: Int!
  userId: ID!
  title:String
  price:String!
}
  type User {
    _id:ID
    firstName: String
    lastName: String
    email: String
    password: String
    role:String
    message:String
  }
 type LoginResponse {
  userId: ID
  token: String
  message:String
}
  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    role:String!
  }
  input UserLoginInput {
    email: String!
    password: String
  }
  
  type Todo{
    id:ID
    title:String
    price:String
    description:String

  }
  input TodoCreate{
    title:String
    price:String
    description:String
  }
  type Mutation {
    signUpUser(
      firstName:String
      lastName:String
      email:String 
      password:String
      role:String
      ): User!
      loginUser(email: String, password: String ): LoginResponse! 
      loginUserWithGoogle(googleAuthCode: String!): LoginResponse!
    createTodo(addElement: TodoCreate): Todo 
    addToCart(productId: ID!, quantity: Int!): CartItem
  }
`;

module.exports = {
    typeDefs,
  };


