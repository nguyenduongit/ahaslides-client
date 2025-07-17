const express = require("express");
const serverless = require("serverless-http");
const fetch = require("node-fetch");

const app = express();
// Middleware để parse JSON body cho các request POST
app.use(express.json());

const router = express.Router();

// --- ROUTE 1 (GET): Lấy dữ liệu trình bày chính ---
router.get("/get-data-ahaslides/:uniqueAccessCode", async (req, res) => {
  const { uniqueAccessCode } = req.params;
  const ahaslidesApiUrl = `https://audience.ahaslides.com/api/presentation/audience-data/${uniqueAccessCode}`;
  try {
    const response = await fetch(ahaslidesApiUrl);
    if (!response.ok) {
      // Trả về đúng status code từ AhaSlides nếu có lỗi
      return res
        .status(response.status)
        .json({ error: `AhaSlides API error: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Không thể gọi API của AhaSlides.",
      details: error.message,
    });
  }
});

// --- ROUTE 2 (GET): Lấy dữ liệu câu trả lời cho slide ---
router.get(
  "/get-data-ahaslides/:uniqueAccessCode/:slideId",
  async (req, res) => {
    const { uniqueAccessCode, slideId } = req.params;
    const ahaslidesApiUrl = `https://audience.ahaslides.com/api/slide-option/list/?type=imageChoice&slideId=${slideId}&uniqueAccessCode=${uniqueAccessCode}`;
    try {
      const response = await fetch(ahaslidesApiUrl);
      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: `AhaSlides API error: ${response.statusText}` });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: "Không thể lấy dữ liệu câu trả lời từ AhaSlides.",
        details: error.message,
      });
    }
  }
);

// Gắn router vào đường dẫn '/api/'.
// Netlify sẽ xử lý việc rewrite từ /api/* đến đây, và Express sẽ xử lý phần còn lại.
app.use("/api/", router);

// Xuất handler để Netlify có thể sử dụng
module.exports.handler = serverless(app);
