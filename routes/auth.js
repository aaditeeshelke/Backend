const express = require('express');
const router = express.Router();
const User = require('../models/User');

const Purchase = require('../models/Purchase');
const Publisher = require('../models/publisher'); // Adjust the path if necessary

// POST /api/auth/books
// Add a new book
router.post('/books', async (req, res) => {
  const { publisherName, authorName, bookDetails } = req.body;

  // Check if bookDetails is provided
  if (!bookDetails) {
    return res.status(400).json({ message: 'Book details are required' });
  }

  const { bookName, imgUrl, description, publisherDate, totalCopies, purchasedCopies = 0 } = bookDetails;

  // Check if all required book fields are provided
  if (!bookName || !imgUrl || !description || !publisherDate || !totalCopies) {
    return res.status(400).json({ message: 'All book details are required' });
  }

  try {
    console.log('Request body:', req.body);

    // Find the publisher by name
    let publisher = await Publisher.findOne({ publisherName });
    console.log('Found publisher:', publisher);

    // If publisher does not exist, create a new one
    if (!publisher) {
      publisher = new Publisher({
        publisherName,
        authors: []
      });
      console.log('Created new publisher:', publisher);
    }

    // Find the author within the publisher's authors array
    let author = publisher.authors.find(author => author.authorName === authorName);
    console.log('Found author:', author);

    // If author does not exist for the publisher, create a new author
    if (!author) {
      author = {
        authorName,
        books: []
      };
      publisher.authors.push(author);
      console.log('Created new author:', author);
    }

    // Create the new book
    const newBook = {
      bookName,
      imgUrl,
      description,
      publisherDate: new Date(publisherDate),
      totalCopies,
      purchasedCopies
    };

    // Add the new book to the author's books array
    author.books.push(newBook);
    console.log('Added new book:', newBook);

    // Ensure author reference in publisher is updated
    publisher.authors = publisher.authors.map(auth =>
      auth.authorName === authorName ? author : auth
    );

    // Save the updated publisher document
    await publisher.save();
    console.log('Saved publisher:', publisher);

    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    console.error('Failed to add book:', error);
    res.status(500).json({ message: 'Failed to add book', error });
  }
});

// Fetch all publishers with their authors and books
router.get('/publishers', async (req, res) => {
  try {
    const publishers = await Publisher.find();
    res.status(200).json(publishers);
  } catch (error) {
    console.error('Failed to fetch publishers:', error);
    res.status(500).json({ message: 'Failed to fetch publishers', error });
  }
});

// Create a new book
/*router.post('/books', async (req, res) => {
  try {
    const { bookName, authorName, publisherName, imgUrl, description, publisherDate, totalCopies } = req.body;

    // Find or create author
    let author = await Author.findOne({ authorName });
    if (!author) {
      author = new Author({ authorName });
      await author.save();
    }

    // Find or create publisher
    let publisher = await Publisher.findOne({ publisherName });
    if (!publisher) {
      publisher = new Publisher({ publisherName });
    }

    // Create new book
    const newBook = new Book({
      bookName,
      author: author._id,
      imgUrl,
      description,
      publisherDate,
      totalCopies
    });

    // Push new book to publisher and author
    publisher.books.push(newBook);
    author.books.push(newBook);

    // Save all changes
    await newBook.save();
    await publisher.save();
    await author.save();

    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch all books with nested author and publisher details
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find()
      .populate({
        path: 'author',
        populate: {
          path: 'publisher',
          model: 'Publisher'
        }
      })
      .exec();

    const structuredData = {};

    books.forEach(book => {
      const author = book.author;
      const publisher = author ? author.publisher : null;

      if (publisher) {
        const publisherName = publisher.publisherName;
        const authorName = author.authorName;

        if (!structuredData[publisherName]) {
          structuredData[publisherName] = {};
        }
        if (!structuredData[publisherName][authorName]) {
          structuredData[publisherName][authorName] = [];
        }
        structuredData[publisherName][authorName].push(book);
      }
    });

    res.json(structuredData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/
// Create a new book


// Register
router.post('/register', async (req, res) => {
  try {
    const { email, role } = req.body;
    let assignedRole = role || "user";

    if (!role && email && email.endsWith('@numetry.com')) {
      assignedRole = "admin";
    }

    const newUser = new User({ ...req.body, role: assignedRole });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
/*router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      user.lastLogin = new Date();
      user.loginTimes.push(new Date());
      await user.save();

      if (user.role === 'user') {
        res.json({ redirect: '/user-dashboard' });
      } else if (user.role === 'admin') {
        res.json({ redirect: '/admin-dashboard' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const loginTime = new Date(); // Create a new Date object for login time
      user.lastLogin = loginTime; // Update lastLogin field
      user.loginTimes.push(loginTime); // Push loginTime into loginTimes array
      await user.save();

      res.json({
        redirect: user.role === 'user' ? '/user-dashboard' : '/admin-dashboard',
        userId: user._id, // Include userId in the response
        loginTime: loginTime.toISOString(), // Send loginTime as ISO string to frontend if needed
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user
/*router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (updatedUser) {
      res.json({ message: 'User updated successfully', user: updatedUser });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/
// Update a user
router.put('/users/:id', async (req, res) => {
  const userId = req.params.userId;
  const { username, loginTime, logoutTime } = req.body;

  try {
    // Fetch user by userId
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    user.username = username;
    user.loginTime = loginTime; // Assuming loginTime and logoutTime are Date objects
    user.logoutTime = logoutTime;

    // Save updated user
    user = await user.save();

    res.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID and delete
    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const { isValidObjectId } = require('mongoose');

router.post('/buy', async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch publisher and book details
    const publisher = await Publisher.findOne(
      { 'authors.books._id': bookId },
      { 'authors.$': 1, publisherName: 1 }
    );

    if (!publisher) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Find the specific author and book
    const author = publisher.authors[0];
    const book = author.books.id(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book details not found' });
    }

    // Check if there are enough copies to purchase
    if (book.totalCopies <= 0) {
      return res.status(400).json({ error: 'No more copies available' });
    }

    // Update book copies
    const updateResult = await Publisher.updateOne(
      { 'authors._id': author._id, 'authors.books._id': bookId },
      {
        $inc: {
          'authors.$[author].books.$[book].totalCopies': -1,
          'authors.$[author].books.$[book].purchasedCopies': 1,
        },
      },
      {
        arrayFilters: [{ 'author._id': author._id }, { 'book._id': bookId }],
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error('Failed to update book copies');
    }

    // Create a new Purchase document
    const purchase = new Purchase({
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
      },
      book: {
        _id: book._id,
        bookName: book.bookName,
        totalCopies: book.totalCopies - 1, // Decrease total copies by 1
        purchasedCopies: book.purchasedCopies + 1, // Increase purchased copies by 1
      },
      publisher: {
        _id: publisher._id,
        publisherName: publisher.publisherName,
      },
      author: {
        authorName: author.authorName,
      },
      purchaseDate: new Date(),
    });

    // Save the purchase to the database
    await purchase.save();

    res.status(200).json({ message: 'Purchase successful', purchase });
  } catch (error) {
    console.error('Error while purchasing:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});
// GET /api/auth/purchased-books
router.get('/purchased-books', async (req, res) => {
  try {
    const publishers = await Publisher.find();
    const purchasedBooks = [];

    publishers.forEach(publisher => {
      publisher.authors.forEach(author => {
        author.books.forEach(book => {
          if (book.purchasedCopies > 0) {
            purchasedBooks.push({
              ...book._doc,
              authorName: author.authorName,
              publisherName: publisher.publisherName,
            });
          }
        });
      });
    });

    res.status(200).json(purchasedBooks);
  } catch (error) {
    console.error('Failed to fetch purchased books:', error);
    res.status(500).json({ message: 'Failed to fetch purchased books', error });
  }
});
router.put('/books/:bookId', async (req, res) => {
  const bookId = req.params.bookId;
  const { bookName, totalCopies, purchasedCopies } = req.body;

  try {
    // Find the publisher that contains the book with the given bookId
    const publisher = await Publisher.findOne({ 'authors.books._id': bookId });

    if (!publisher) {
      return res.status(404).json({ message: 'Publisher not found' });
    }

    // Find the author containing the book
    const author = publisher.authors.find((author) =>
      author.books.some((book) => book._id.toString() === bookId)
    );

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Find the book to update
    const bookToUpdate = author.books.find((book) => book._id.toString() === bookId);

    if (!bookToUpdate) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update the book fields
    bookToUpdate.bookName = bookName;
    bookToUpdate.totalCopies = totalCopies;
    bookToUpdate.purchasedCopies = purchasedCopies;

    // Save the updated publisher document
    await publisher.save();

    // Construct the response object with necessary fields including publisherName and authorName
    const responseBook = {
      _id: bookToUpdate._id,
      bookName: bookToUpdate.bookName,
      totalCopies: bookToUpdate.totalCopies,
      purchasedCopies: bookToUpdate.purchasedCopies,
      imgUrl: bookToUpdate.imgUrl, 
      publisherDate:bookToUpdate.publisherDate,// Assuming 'imgUrl' is a field in your Book schema
      publisherName: publisher.publisherName, // Assuming 'publisherName' is a field in Publisher schema
      authorName: author.authorName,          // Assuming 'authorName' is a field in Author schema
    };

    res.status(200).json(responseBook);
  } catch (error) {
    console.error('Failed to update book:', error);
    res.status(500).json({ message: 'Failed to update book', error });
  }
});
router.get('/purchases', async (req, res) => {
  try {
    console.log('Received request to fetch purchases');
    const purchases = await Purchase.find().lean(); // Using lean() to get plain JavaScript objects
    console.log('Fetched purchases:', purchases);
    res.status(200).json(purchases);
  } catch (error) {
    console.error('Failed to fetch purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});
// DELETE /api/auth/books/:bookId
// Delete a book
router.delete('/books/:bookId', async (req, res) => {
  const { bookId } = req.params;

  try {
    let publisher = await Publisher.findOne({ 'authors.books._id': bookId });

    if (!publisher) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let author = publisher.authors.find(author =>
      author.books.some(book => book._id.toString() === bookId)
    );

    author.books = author.books.filter(book => book._id.toString() !== bookId);

    if (author.books.length === 0) {
      publisher.authors = publisher.authors.filter(auth => auth.authorName !== author.authorName);
    }

    await publisher.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Failed to delete book:', error);
    res.status(500).json({ message: 'Failed to delete book', error });
  }
});
// Example route to get user count
router.get('/users/count-by-role', async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: 'user' });
    const adminsCount = await User.countDocuments({ role: 'admin' });
    res.json({ users: usersCount, admins: adminsCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get count of publishers
router.get('/publishers/count', async (req, res) => {
  try {
    const publisherCount = await Publisher.countDocuments();
    res.json({ count: publisherCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to get count of all books across authors under all publishers
router.get('/books/count', async (req, res) => {
  try {
    const publishers = await Publisher.find().populate({
      path: 'authors',
      populate: { path: 'books' } // Populate books within each author
    });

    let bookCount = 0;

    publishers.forEach(publisher => {
      publisher.authors.forEach(author => {
        bookCount += author.books.length;
      });
    });

    res.json({ count: bookCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// GET total purchases count
router.get('/purchases/count', async (req, res) => {
  try {
    const count = await Purchase.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/purchases/by-publisher', async (req, res) => {
  try {
    const data = await Purchase.aggregate([
      {
        $lookup: {
          from: 'publishers',  // Replace with actual collection name for Publisher
          localField: 'publisher._id',
          foreignField: '_id',
          as: 'publisher'
        }
      },
      {
        $unwind: '$publisher'
      },
      {
        $group: {
          _id: '$publisher.publisherName',
          purchasedCopies: { $sum: '$book.purchasedCopies' }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    console.error('Error fetching purchase data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to fetch purchase data grouped by date
router.get('/purchases/by-date', async (req, res) => {
  try {
    const purchasesByDate = await Purchase.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
          userCount: { $sum: 1 }, // Count of users on each date
        },
      },
      { $sort: { _id: 1 } } // Sort by date ascending
    ]);

    res.json(purchasesByDate);
  } catch (err) {
    console.error('Error fetching purchase data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
