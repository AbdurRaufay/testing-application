const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Todos = require("./todoModel.js");
const User = require("./userModel.js");
const CartItem = require("./cartItemModel.js")
const resolvers = {
  Query: {
    users: async () => {
      try {
        const allUsers = await User.find();
        return allUsers;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    todos: async () => {
      try {
        const allTodos = await Todos.find()
        return allTodos
      } catch (err) {
        console.log(err, "err")
        throw err
      }
    },
    todo: async (_, { todoId }) => {
      try {
        const todo = await Todos.findById(todoId);
        if (!todo) {
          throw new Error("Todo not found");
        }
        return todo;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    cartItems: async (_, { userId }) => {
      try {
        if (!userId) {
          throw new Error('Cart items query: You must be logged in.');
        }
        const cartItems = await CartItem.find({ userId });
        return cartItems;
      } catch (err) {
        console.log(err);
      }
    },
    cartItemById: async (_, { cartItemId }) => {
      try {
        const cartItem = await CartItem.findById(cartItemId);
        if (!cartItem) {
          throw new Error("Cart item not found");
        }
        return cartItem;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  Mutation: {
    signUpUser: async (_, { firstName, lastName, email, password, role }) => {
      console.log(firstName, lastName, email, password, role)
      try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
          return {
            message: "User already exists with that email"
          };
        }
        const hashPassword = await bcrypt.hash(password, 10);
       await User.create({
          firstName,
          lastName,
          email,
          password: hashPassword,
          role: role
        });
        console.log(userNew, "ok")
        return {
          firstName, lastName, email, password, role, message: "ok"
        }

      } catch (err) {
        return {
          message: err.message
        };
      }
    },

    // signUpUser: async ({ firstName, lastName, email, password, role }) => {
    //   try {
    //     const existingUser = await User.findOne({ email: email });
    //     if (existingUser) {
    //       throw new Error('User already exists with that email');
    //     }
    //     const hashPassword = await bcrypt.hash(password, 10);
    //     const userNew = await User.create({
    //       firstName,
    //       lastName,
    //       email,
    //       password: hashPassword,
    //       role: role || 'user',
    //     });
    //     return userNew;
    //   } catch (err) {
    //     console.log(err);
    //     throw err;
    //   }
    // },

    loginUser: async (_, { email, password, googleAuthCode }) => {
      try {
        if (!email || !password) {
          // Regular email/password login
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error('User does not exist with that email');
          }

          const doMatch = await bcrypt.compare(password, user.password);
          if (!doMatch) {
            throw new Error('Email or password do not match');
          }

          // Email/password login successful, generate token
          const token = jwt.sign({ userId: user._id }, 'your_secret_key_here', {
            expiresIn: '1d',
          });

          return {
            userId: user._id,
            token,
            message: 'Login successful',
          };
        } else if (googleAuthCode) {
          // Google OAuth login
          const profile = await new Promise((resolve, reject) => {
            passport.authenticate('google', { session: false }, (err, user) => {
              if (err || !user) {
                reject(err);
              }
              resolve(user);
            })({ query: { code: googleAuthCode } });
          });

          const user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            // Create a new user if not found
            const newUser = await User.create({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
              role: 'user', // Set the user role as per your requirements
            });
            // Google OAuth login successful, generate token for the new user
            const token = jwt.sign({ userId: newUser._id }, 'your_secret_key_here', {
              expiresIn: '1d',
            });

            return {
              userId: newUser._id,
              token,
              message: 'Login successful',
            };
          } else {
            // Google OAuth login successful, generate token for the existing user
            const token = jwt.sign({ userId: user._id }, 'your_secret_key_here', {
              expiresIn: '1d',
            });

            return {
              userId: user._id,
              token,
              message: 'Login successful',
            };
          }
        } else {
          throw new Error('Invalid login credentials');
        }
      } catch (err) {
        return {
          message: err.message,
        };
      }
    },
    loginUserWithGoogle: async (_, { googleAuthCode }) => {
      try {
        // Google OAuth login logic
        const profile = await new Promise((resolve, reject) => {
          passport.authenticate('google', { session: false }, (err, user) => {
            if (err || !user) {
              reject(err);
            }
            resolve(user);
          })({ query: { code: googleAuthCode } });
        });

        const user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          // Create a new user if not found
          const newUser = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            role: 'user', // Set the user role as per your requirements
          });

          // Google OAuth login successful, generate token for the new user
          const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
          });

          return {
            userId: newUser._id,
            token,
            message: 'Login successful',
          };
        } else {
          // Google OAuth login successful, generate token for the existing user
          const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
          });

          return {
            userId: user._id,
            token,
            message: 'Login successful',
          };
        }
      } catch (err) {
        return {
          message: err.message,
        };
      }
    },
    createTodo: async (_, { addElement }, { userId }) => {
      try {
        if (!userId) {
          throw new Error('Create Todo you must be logged in.');
        }
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        if (user.role !== 'seller') {
          throw new Error('Only sellers can create todos');
        }

        const newTodo = await Todos.create(addElement);
        return newTodo;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    addToCart: async (_, { productId, quantity }, { userId }) => {
      try {
        if (!userId) {
          throw new Error('You must be logged in to add items to the cart.');
        }

        // Fetch the Todo (product) based on the given productId
        const todo = await Todos.findById(productId);

        if (!todo) {
          throw new Error('Product not found.');
        }

        const existingCartItem = await CartItem.findOne({ productId, userId });

        if (existingCartItem) {
          // Item already exists in the cart, update the quantity and calculate the new price
          const newQuantity = quantity;
          const newPrice = (parseFloat(todo.price) * newQuantity).toFixed(2);
          existingCartItem.quantity = newQuantity;
          existingCartItem.price = newPrice;
          const cartItem = await existingCartItem.save();
          return cartItem;
        } else {
          // Create a new cart item
          const price = (parseFloat(todo.price) * quantity).toFixed(2);
          const cartItem = new CartItem({
            productId,
            title: todo.title,
            price,
            quantity,
            userId,
          });

          await cartItem.save();
          return cartItem;
        }
      } catch (err) {
        console.error(err);
        throw new Error('An error occurred while adding the item to the cart.');
      }
    },

  },
};

module.exports = {
  resolvers,
};

