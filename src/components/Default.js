import React from "react";
function DefaultPage() {
  return (
    <>
      <div className="default-container">
        <h1>Welcome to Intellibot!</h1>
        
        <p>Start a conversation by clicking the <b>"+ New Conversation"</b> button.</p>
        <p>To Generate image use "create image:" <br/>Ex:  Prompt(<b>create image: a red car with gold doors in 4k quality</b>)</p>
      </div>
      <div class="info-container">
        <div class="info-plan">
          <div class="info-title">Capabilities</div>
          <ul class="info-features">
            <li>
            Remembers the user's past statements made across the conversation.

            </li>

            <li>
              Ability to speak the response.
            </li>
            <li>
            Due to extensive training, it easily spot and reject unethical requests.
            </li>
          </ul>
        </div>
        <div class="info-plan">
          <div class="info-title">Examples</div>
          <ul class="info-features">
            <li> “What is Java?” ↵&#8195;&#8195;&#8195;&#8195; &#8195;&#8195;&#8195;&#8195; &#8195;&#8195;</li>
            <li>
              {" "}
              “Give me some inspiration for a serene painting"
              ↵ &#8195;&#8195;&#8195;&#8195; &#8195;&#8195;
            </li>
            <li>
              {" "}
              "Provide a simple explanation of how fetch API works"
              ↵ 
            </li>
          </ul>
        </div>
        <div class="info-plan">
          <div class="info-title">Constraints</div>
          <ul class="info-features">
            <li> Sometimes inaccurate information may be generated &#8195;&#8195;&#8195; &#8195;&#8195;&#8195;&#8195;&#8195;&#8195;&#8195;&#8195;&#8195;</li>
            <li> Occasionally, harmful or biased content may be generated &#8195;&#8195;&#8195;&#8195;</li>
            <li> Response chat limit : 100 words</li>
          </ul>
        </div>
      </div>
    </>
  );
}
export default DefaultPage;
