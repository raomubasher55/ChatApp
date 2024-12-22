const User = require("../models/User");
const Chat = require("../models/Chat");
const Group = require("../models/Group");
const Member = require('../models/Member');
const bcrypt = require("bcrypt");

exports.registerLoad = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
exports.register = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      image: "images/" + req.file.filename,
      password: hashedPassword,
    });

    await user.save();
    res.render("register", { message: "Your Account is Created Successfully" });
    // res.status(201).json({
    //     success: true,
    //     message: 'Your registration has been completed!',
    //     user,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

exports.loginLoad = (req, res) => {
  res.render("login", { message: null }); // Render login.ejs with no error
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { message: "Invalid email or password." });
    }
    if (isMatch) {
      req.session.user = user;
      res.cookie("user", JSON.stringify(user));
      res.redirect("/auth/dashboard");
    }

    // If successful, redirect to a dashboard or return success JSON
    // res.status(200).json({
    //     success: true,
    //     message: 'Login successful!',
    // });
    // res.render('dashboard',{user: user} , { message: "You have Successfull Login" }); // Render login.ejs with no error
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.loadDashboard = async (req, res) => {
  try {
    const users = await User.find({ _id: { $nin: [req.session.user._id] } });
    const user = req.session.user; // Assuming user is stored in session
    res.render("layouts/layout", {
      title: "Dashboard",
      content: "../dashboard", // Refers to the dashboard.ejs file
      user,
      users,
      activePage: "dashboard",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// save chat
exports.saveChat = async (req, res) => {
  try {
    const chat = new Chat({
      sender_id: req.body.senderId,
      recevier_id: req.body.receiverId,
      message: req.body.message,
    });

    await chat.save();
    res.status(200).json({
      success: true,
      message: "Message Create successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    // Validate if the ID exists in the request body
    if (!req.body.id) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    // Attempt to delete the chat with the given ID
    const result = await Chat.deleteOne({ _id: req.body.id });

    // If no documents were deleted, return a response indicating the chat wasn't found
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Chat successfully deleted.",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

exports.updateChat = async (req, res) => {
  try {
    // Validate if the ID exists in the request body
    if (!req.body.id) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    // Update the chat message in the database
    const updatedChat = await Chat.findByIdAndUpdate(
      req.body.id,
      { $set: { message: req.body.message } },
      { new: true } // Return the updated document
    );

    console.log(req.body.message);

    // If the chat is not found, return an error response
    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Chat successfully Updated.",
      updatedChat,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({
      success: false,
      message: "Internal Server Error." + error.message,
    });
  }
};

exports.loadGroup = async (req, res) => {
  // res.render('group', { title: 'Group Page' });
  const groups = await Group.find({craetorId: req.session.user._id}); 

  res.render("layouts/layout", {
    title: "Group",
    content: "../group", // Refers to the dashboard.ejs file
    activePage: "group",
    groups,
  });
};

exports.createGroup = async (req, res) => {
  try {


    const group = new Group({
    craetorId: req.session.user._id,
      name: req.body.name,
      image: "/images/" + req.file.filename,
      limit: req.body.limit,
    });

    await group.save();

    // res.render('group', {
    //     title: 'Group Page',
    //     user: req.session.user, // Pass the logged-in user's data
    //     message: 'Group created successfully!',
    // });
    res.redirect("/auth/group?message=Group created successfully!");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error." + error.message,
    });
  }
};

// get Members
exports.getMembers  = async(req,res)=>{
    try {
        const users = await User.find({_id: {$nin:[req.session.user._id]}});

        res.status(200).json({
            success: true,
            users
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error." + error.message,
          });
    }
}


exports.addMember = async (req, res) => {
  try {
    const { groupId, memberIds } = req.body; // groupId and memberIds are passed from the frontend

    // Find the group and update its members
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Add new members to the group
    memberIds.forEach((memberId) => {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);
      }
    });

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Members added successfully!',
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destory();
    res.clearCookie("user");
    req.redirect("/auth/login");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error." + error.message,
    });
  }
};
