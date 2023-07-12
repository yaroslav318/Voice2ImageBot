import React from "react";
function DefaultPage() {
  return (
    <>
      <div className="default-container">
      <div className="welcome">
        <h1>Welcome to Intellibot!</h1>
        <p>Start a conversation by clicking the <b>"+ New Conversation"</b> button.</p>
        <p>To Generate image use Command <b>"create image:"</b> <br/></p>
      </div>
       
      <div className="info-container">
        <div className="info-plan">
          <div className="info-title">Capabilities</div>
          <ul className="info-features">
            <li>
            Remembers the user's past statements made across the conversation.
            </li>
            <li>
              Ability to speak the response.
            </li>
            <li>
            Features for image generation.
            </li>
            <li>
            Voice Assisting features.
            </li>
            <li>
            Due to extensive training, it easily spot and reject unethical requests.
            </li>
            
          </ul>
        </div>
        <div className="info-plan">
          <div className="info-title">Examples</div>
          <ul className="info-features">
            <li> “What is Java?” <b>↵</b></li>
            <li>
              {" "}
              “Give me some inspiration for a serene painting"<b>↵</b>
            </li>
            <li>
              {" "}
              "Provide a simple explanation of how fetch API works"<b>↵</b> 
            </li>
            <li>
            "create image: a red car with gold doors in 4k quality"<b>↵</b> 
            </li>
          </ul>
        </div>
        <div className="info-plan">
          <div className="info-title">Constraints</div>
          <ul className="info-features">
            <li> Sometimes inaccurate information may be generated. &#8195;&#8195;&#8195;&#8195;&#8195;&#8195;&#8195;&#8195;</li>
            <li> Occasionally, harmful or biased content may be generated. &#8195;&#8195;&#8195;&#8195; &#8195;&#8195;&#8195;&#8195; </li>
            <li> Response chat limit:100 words. &#8195;&#8195;&#8195;&#8195;</li>
            <li>Response time may be delayed</li>
          </ul>
        </div>
      </div></div>
    </>
  );
}
export default DefaultPage;
