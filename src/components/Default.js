import React from "react";
function DefaultPage() {
  return (
    <>
      <div className="default-container">
        <h1>Welcome to Intellibot!</h1>
        <p>Start a conversation by clicking the <b>"+ New Conversation"</b> button.</p>
      </div>
      <div class="info-container">
        <div class="info-plan">
          <div class="info-title">Capabilities</div>
          <ul class="info-features">
            <li>
            Remembers the user's past statements made across the conversation.

            </li>

            <li>
              Enables the user to offer subsequent corrections or amendments.
            </li>
            <li>
            Due to extensive training, it easily spot and reject unethical requests.
            </li>
          </ul>
        </div>
        <div class="info-plan">
          <div class="info-title">Examples</div>
          <ul class="info-features">
            <li> “What is Java?” ↵&#8195;&#8195;&#8195;&#8195; &#8195;&#8195;</li>
            <li>
              {" "}
              “Give me some inspiration for a serene painting"
              ↵ &#8195;&#8195;&#8195;&#8195; &#8195;&#8195;
            </li>
            <li>
              {" "}
              "provide a simple explanation of how Fetch API works"
              ↵ &#8195;&#8195;&#8195;
            </li>
          </ul>
        </div>
        <div class="info-plan">
          <div class="info-title">Constraints</div>
          <ul class="info-features">
            <li> Sometimes inaccurate information may be generated</li>
            <li> Occasionally, harmful or biased content may be generated</li>
            <li> response character limit : 100 characters</li>
          </ul>
        </div>
      </div>
    </>
  );
}
export default DefaultPage;
