const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: '../uploads/Course',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },  
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'courseImage', maxCount: 1 },
  { name: 'demoVideo', maxCount: 1 },
  { name: 'sectionVideos', maxCount: 10 }
]);

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const imageFileTypes = /jpeg|jpg|png|gif/;
  const videoFileTypes = /mp4|mkv|avi/;
  
  // Check ext
  const extname = imageFileTypes.test(path.extname(file.originalname).toLowerCase()) || 
                  videoFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime
  const mimetype = imageFileTypes.test(file.mimetype) || 
                   videoFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and Videos Only!');
  }
}

module.exports = upload;
