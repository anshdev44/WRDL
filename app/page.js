import React from "react";
import TextType from "./TextType";
import Nav from "./components/nav";
import Rules from "./components/rules";

//main landing page
const page = () => {
  return (
    <div>
      <Nav />
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-[200px]  w-[80%] h-auto mx-auto mt-20 ">
        <div className="flex-1 flex items-center">
          <div className="mt-20 text-3xl  md:text-8xl  font-bold">
            <TextType
              text={[
                "Expand Your Lexicon",
                "Battle of Words",
                "Unleash Your Vocabulary",
                "Conquer the Word Arena",
                "Master the Art of Words",
                "Elevate Your Word Power",
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              loop={true}
            />
          </div>
        </div>
        <div className="flex justify-center gap-[500px]">
          <div className="flex gap-20 justify-center mt-8">
            <button className="bg-blue-600 cursor-pointer text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-blue-700 hover:scale-120 transition-transform duration-300">
              Create Room
            </button>

            <button className="bg-red-600 cursor-pointer text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 hover:scale-120 transition-transform duration-300">
              Join Room
            </button>
          </div>
        </div>
      </div>
      {/* rules Section */}
      <div className="mt-[20%]"></div>
     {/* <Rules /> */}
    </div>
  );
};

export default page;
