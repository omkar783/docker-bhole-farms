const fs = require('fs');
const path = require('path');

const src1 = "C:\\Users\\NKS-WIN-Omkar\\.gemini\\antigravity\\brain\\c253051f-cb92-4032-961f-a8be37ba931b\\about_drone_orchard_1784037969382.jpg";
const dest1 = "c:\\Users\\NKS-WIN-Omkar\\Documents\\bhole\\public\\images\\about-drone-orchard.jpg";

const src2 = "C:\\Users\\NKS-WIN-Omkar\\.gemini\\antigravity\\brain\\c253051f-cb92-4032-961f-a8be37ba931b\\farmer_harvesting_1784038028084.jpg";
const dest2 = "c:\\Users\\NKS-WIN-Omkar\\Documents\\bhole\\public\\images\\farmer-harvesting.jpg";

try {
  if (fs.existsSync(src1)) {
    fs.copyFileSync(src1, dest1);
    console.log("Copied drone orchard successfully!");
  } else {
    console.log("src1 not found");
  }

  if (fs.existsSync(src2)) {
    fs.copyFileSync(src2, dest2);
    console.log("Copied farmer harvesting successfully!");
  } else {
    console.log("src2 not found");
  }
} catch (e) {
  console.error("Error copying file:", e);
}
