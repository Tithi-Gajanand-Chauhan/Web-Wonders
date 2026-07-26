require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const result = await model.generateContent(
      "Suggest a funny Hindi movie for a group of friends."
    );

    console.log("SUCCESS");
    console.log(result.response.text());

  } catch (error) {
    console.log("ERROR");
    console.log(error.message);
  }
}

test();