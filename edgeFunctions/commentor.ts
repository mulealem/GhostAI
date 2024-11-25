import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const GOOGLE_CUSTOM_SEARCH_API_KEY = "YOUR_GOOGLE_CUSTOM_SEARCH_API_KEY";
const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = "YOUR_GOOGLE_CUSTOM_SEARCH_ENGINE_ID";
const SAMBONOVA_AI_API_KEY = "YOUR_SAMBONOVA_AI_API_KEY";

async function search_question(query: string) {
  console.log("Search Query:", query);
  // return "Game of Throne spinoff, House of the Dragon, is set to premiere in 2022.";
  const searchURL = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${GOOGLE_CUSTOM_SEARCH_ENGINE_ID}&q=${query}`;

  return fetch(searchURL)
    .then(async (response) => {
      const result = await response.json();
      return Promise.resolve(
        result.items.map((item: any) => item.snippet).join("\n")
      );
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

function sambanovaLLM(messages: any) {
  const llmURL = "https://api.sambanova.ai/v1/chat/completions";

  return fetch(llmURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SAMBONOVA_AI_API_KEY}`,
    },
    body: JSON.stringify({
      stream: false,
      model: "Meta-Llama-3.1-70B-Instruct",
      messages: messages,
    }),
  })
    .then(async (response) => {
      const result = await response.json();
      console.log(
        "##################################################################"
      );
      //   console.log(
      //     "Result: >>>",
      //     result?.choices[0]?.message?.content,
      //     result?.choices && result?.choices?.length > 0
      //   );
      if (result?.choices && result?.choices?.length > 0) {
        return Promise.resolve(result?.choices[0]?.message?.content);
      } else {
        return null;
      }
      //   return Promise.resolve(result?.choices[0]?.message.content);
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      return Promise.reject(error);
    });
}

// Update available_actions
const available_actions = {
  search_question: search_question, // Add a function to handle searches
};

// Update systemPrompt
// , where each of them may have differnt personality, differnt prespective, may also be similar, format them in a form of tweet replay
let systemPrompt = `You run in a loop of Thought, Action, PAUSE, Action_Response.
At the end of the loop you output an Answer.
Use Thought to understand the user's request, which contains a Twitter post.
Determine if you need to search a question or not, posts that needs searching include are Questions or Inquiries, References to Real-World Events, Recommendations or Comparisons, Searchable Entities, Requests for Definitions, Fact-Checking or Debates, Specific Time-Sensitive Context, Instructions or How-Tos, Trends and Pop Culture and Posts that doesn't need search are Personal or Subjective Posts, Generic Expressions or Opinions, Posts That Don't Require External Knowledge.
If a search is needed, use Action to call the search_question function.
If no search is needed, create a list of comments (about 7 to 15 in count, where each of them may have differnt personality, differnt prespective, may also be similar, format them in a form of tweet replay) in JSON format as [{ "post": "Generated comment content here",        "date": "10/28/2024",        "username": "@username",        "full_name": "Full Name", "bookmarks": 7, "comments": 6, "shares": 25, "image": "https://example.com/image.jpg", "isEmotional": false, "emotion": "surprised"}].
Your available actions are:
search_question:
e.g. search_question: What is the capital of France?
Performs a search to find the answer to a question
Example session:
Question: [User's Twitter post]
Thought: [Determine if search is needed]
Action:
{
"type": "action",
"function_name": "search_question",
"function_parms": "the twitter post"
}

The final answer should be in the form of a list of comments (about 7 to 15 in count, where each of them may have differnt personality, differnt prespective, may also be similar, format them in a form of tweet replay) as JSON:
{
"type": "answer",
data: [{ "post": "Generated comment content here",        "date": "10/28/2024",        "username": "@username",        "full_name": "Full Name", "bookmarks": 7, "comments": 6, "shares": 25, "image": "https://example.com/image.jpg", "isEmotional": false, "emotion": "surprised"}]
}
`;

let userPrompt = ``;

let messages = [
  {
    role: "system",
    content: systemPrompt,
  },
  {
    role: "user",
    content: userPrompt,
  },
];

function extractJsonFromText(text) {
  if (!text || typeof text !== "string") {
    console.error("Invalid text provided.");
    return null;
  }
  let stack = [];
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      if (stack.length === 0) {
        start = i; // Mark the start of the JSON object
      }
      stack.push("{");
    } else if (text[i] === "}") {
      stack.pop();
      if (stack.length === 0 && start !== -1) {
        const jsonString = text.slice(start, i + 1);
        try {
          return JSON.parse(jsonString); // Attempt to parse the extracted JSON
        } catch (error) {
          console.error("Invalid JSON:", error);
          return null;
        }
      }
    }
  }

  console.log("No valid JSON found in the text.");
  return null;
}

function extract_json(json: any) {
  //   const json = response.choices[0].message;
  try {
    // console.log("IS String:", typeof json, json);
    // if typeof json is object, then return json
    if (typeof json === "object") {
      return json;
    }
    if (typeof json === "string") {
      return JSON.parse(json);
    }
    return null;
  } catch (error) {
    // console.error("Error parsing JSON:", error);
    return null;
  }
}

async function loopReAct(query: string) {
  userPrompt = query;
  messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];
  console.log("User Prompt:", userPrompt);
  let turn_count = 1;
  const max_turns = 12;

  let result = null as any;

  while (turn_count < max_turns) {
    console.log(`Loop: ${turn_count}`);
    console.log("----------------------");
    console.log("Messages:", messages);
    turn_count += 1;

    // console.log("Messages:", messages);

    // const result = await sambanovaLLM(messages);

    await sambanovaLLM(messages)
      .then(async (response) => {
        //   console.log(response);
        const json_function = extractJsonFromText(response);
        // console.log("JSON Function:", response, json_function);

        if (json_function && json_function.type === "action") {
          console.log("JSON Function:", json_function);
          const function_name = json_function.function_name;
          const function_parms = json_function.function_parms;
          if (!(function_name in available_actions)) {
            throw new Error(
              `Unknown action: ${function_name}: ${function_parms}`
            );
          }
          console.log(` -- running ${function_name} ${function_parms}`);
          const action_function = available_actions[function_name];
          const result = await action_function(function_parms);
          const function_result_message = `Action_Response: ${result}`;
          messages.push({ role: "user", content: function_result_message });
          console.log(function_result_message);
        } else {
          console.log("response>", response);
          result = {
            response: extractJsonFromText(response),
          };
          //   console.log(
          //     "Result:",
          //     result !== null,
          //     result.response !== null,
          //     extractJsonFromText(result.response)?.type === "answer",
          //     result && result.response && result.response.type === "answer"
          //   );
          if (result && result.response && result.response?.type === "answer") {
            console.log("Result: Loop: ", turn_count, result.response);
            turn_count = max_turns;
          }
          return;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  // console.log("Done:", result);
  return result?.response?.data;
  //   return messages;
}

// // Implement the agent logic
// async function aiAgent(userInput: string) {
//   // ... existing code ...

//   let finished = false;
//   while (!finished) {
//     // Generate Thought and Action
//     const response = await llm.generate(`${systemPrompt}\nQuestion: ${userInput}\n`);

//     // Parse the Action from response
//     const actionMatch = response.match(/Action:\s*({[\s\S]*?})/);
//     if (actionMatch) {
//       const actionJson = JSON.parse(actionMatch[1]);
//       if (actionJson.function_name === 'search_question') {
//         // Call the search_question function
//         const searchResult = await search_question(actionJson.function_parms);
//         // Handle Action_Response
//         // ...
//       } else {
//         // Output the list of comments
//         const comments = [
//           { comment: "That is cool" },
//           { comment: "There seems to be a misunderstanding to this topic" },
//         ];
//         console.log(JSON.stringify(comments));
//         finished = true;
//       }
//     } else {
//       // Handle other cases
//     }
//   }
// }

// console.log(loopReAct());

// loopReAct();

const supabaseUrl = "https://jvbkmficddtxtwkkhwwy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YmttZmljZGR0eHR3a2tod3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTk5Mzk2NCwiZXhwIjoyMDQ3NTY5OTY0fQ.6o3moVDCB1GN17gVBf2IUx3Bahr4-7iwdBJVpFvkR5o";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req, res) => {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow any origin
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Specify allowed methods
  headers.set("Access-Control-Allow-Headers", "Content-Type"); // Specify allowed headers

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // return;

  const { post, id } = await req.json();
  // console.log("post:", post);
  if (post === undefined || post === null) {
    return new Response("Invalid request: post is required.", {
      status: 400,
    });
  }

  const result = await loopReAct(post);

  const { data, error } = await supabase.from("ai_comments").insert(
    result.map((item) => {
      return {
        post: item.post,
        username: item.username,
        full_name: item.full_name,
        bookmarks: item.bookmarks,
        comments: item.comments,
        shares: item.shares,
        image: item.image,
        isEmotional: item.isEmotional,
        emotion: item.emotion,
        post_id: id,
      };
    })
  );

  if (error) {
    console.error("Error fetching data:", error);
  } else {
    console.log("Data fetched:", data);
  }

  // console.log("Result:", result);

  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

// loopReAct();
