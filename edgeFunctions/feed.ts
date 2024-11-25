import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const NEWS_API_KEY = "YOUR_NEWS_API_KEY";
const GIPHY_API_KEY = "YOUR_GIPHY_API_KEY";
const SAMBANOVA_API_KEY = "YOUR_SAMBANOVA_API_KEY";

async function getAggregatedNews(
  query: string,
  page: number = 1,
  pageSize: number = 3
): Promise<any[]> {
  console.log("NEWS_API_KEY", NEWS_API_KEY);
  const newsAPIResponse = await fetch(
    `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}&pageSize=${pageSize}&page=${page}`
  );
  const newsAPIArticles = await newsAPIResponse.json();

  // console.log(newsAPIArticles);

  if (newsAPIArticles && newsAPIArticles.articles) {
    return [...newsAPIArticles.articles];
  } else {
    return [];
  }
}

function newsToSocialMediaUserPost(news: any) {
  const llmURL = "https://api.sambanova.ai/v1/chat/completions";

  return fetch(llmURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SAMBANOVA_API_KEY}`,
    },
    body: JSON.stringify({
      stream: false,
      model: "Meta-Llama-3.1-70B-Instruct",
      messages: [
        {
          role: "system",
          content: `You are a social media content generator specializing in realistic, human-like  posts. For each article, create 13 posts per article based on the typical personality of random social media users (e.g., casual, humorous, opinionated, sarcastic).Posts should represent varying stances (e.g., supportive, against, neutral) at a ratio of 50-50 or 80-20, as appropriate. Each post should include a plausible username (e.g., @coolcat93) and full name (e.g., "Jamie Lin"), resembling genuine individuals, not companies, each post should be between 160 to 250 characters. If the post created is emotional meaning it contains reactionary content make isEmotional to true and set the emotion as the emotion of the newly created post, since the user provides a news list, randomly assign the image link from the article to one of the posts if there is any image link, random number for bookmark, comment, and share Use the following JSON structure:

[    {        "post": "Generated post content here",        "date": "10/28/2024",        "username": "@username",        "full_name": "Full Name", "bookmarks": 7, "comments": 6, "shares": 25, "isEmotional": false, "emotion": "surprised"     }]

Return only the JSON object, no additional text or explanation.",`,
        },
        {
          role: "user",
          content:
            "Given the following news articles, can you generate a social media post" +
            JSON.stringify(news),
        },
      ],
    }),
  })
    .then((response) => {
      return Promise.resolve(response.json());
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      return Promise.reject(error);
    });
}

async function getGIFsFromGiphy(emotions: string[]) {
  let promises = emotions.map((emotion) => {
    return fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${emotion}&limit=5&offset=0&rating=g&lang=en&bundle=messaging_non_clips`
    ).then(async (response: any) => {
      // console.log("response", await response.json());
      const data = await response.json();
      // return {
      //   emotion: emotion,
      //   gif: await response.json(),
      // };
      return data.data.map((gifResponse: any) => {
        return {
          emotion: emotion,
          gif: gifResponse.images.original.webp,
        };
      });
    });
  });

  return await Promise.all(promises)
    .then((gifs) => {
      return gifs.flat();
    })
    .catch((error) => {
      console.error("Error fetching gifs:", error);
      return Promise.reject(error);
    });
}

serve(async (req: Request) => {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow any origin
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Specify allowed methods
  headers.set("Access-Control-Allow-Headers", "Content-Type"); // Specify allowed headers

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method === "POST") {
    try {
      const { categories, page, pageSize } = await req.json();
      if (!categories || !Array.isArray(categories)) {
        return new Response("Categories must be an array", {
          status: 400,
          headers,
        });
      }

      const aggregatedNewsPromises = categories.map((category) =>
        getAggregatedNews(category, page, pageSize)
      );
      const aggregatedNewsArray = await Promise.all(aggregatedNewsPromises);
      const aggregatedNews = aggregatedNewsArray.flat();

      console.log("There are", aggregatedNews.length, "articles");

      const top5News = aggregatedNews
        .filter((article) => article.title !== "[Removed]")
        .map((article) => ({
          title: article.title,
          description: article.description,
          image: article.urlToImage,
        }));

      const PromiseArray = top5News.map((article) =>
        newsToSocialMediaUserPost(article)
          .then((response) => {
            return Promise.resolve({
              ...response,
              article: article,
            });
          })
          .catch((error) => {
            console.error("Error fetching news:", error);
            return Promise.reject(error);
          })
      );

      return Promise.all(PromiseArray).then(async (socialMediaPosts) => {
        let randomizeSocialMediaPosts = socialMediaPosts
          .map((post) => {
            if (post?.choices) {
              return post?.choices.map((choice: any) => {
                return {
                  ...choice,
                  article: post.article,
                };
              });
            }
          })
          .flat()
          .map((choice) => {
            if (choice?.message?.content) {
              const contents = JSON.parse(choice?.message?.content);
              return contents.map((post: any) => ({
                ...post,
                article: choice.article,
                image:
                  contents.indexOf(post) === 0 ? choice.article.image : null,
              }));
            } else {
              return null;
            }
          })
          .flat()
          .filter((post: any) => post)
          .sort(() => Math.random() - 0.5);

        const uniqueEmotions = randomizeSocialMediaPosts
          .filter((post: any) => post.isEmotional && post.image === null)
          .map((post: any) => post.emotion)
          .filter((value, index, self) => self.indexOf(value) === index);

        const selectedEmotions = uniqueEmotions.slice(
          0,
          Math.ceil(uniqueEmotions.length * 0.4)
        );

        console.log(
          "uniqueEmotions: : : ",
          uniqueEmotions,
          selectedEmotions,
          randomizeSocialMediaPosts.length
        );

        const gifs = await getGIFsFromGiphy(selectedEmotions);

        randomizeSocialMediaPosts = randomizeSocialMediaPosts.map(
          (post: any) => {
            if (post.isEmotional && post.image === null) {
              const emptionGifs = gifs.filter(
                (gif: any) => gif.emotion === post.emotion
              );
              return {
                ...post,
                image:
                  emptionGifs[Math.floor(Math.random() * emptionGifs.length)]
                    ?.gif,
              };
            } else {
              return post;
            }
          }
        );

        // console.log("gifs: : : ", gifs);

        return new Response(
          JSON.stringify({
            socialMediaPosts: randomizeSocialMediaPosts,
            top5News,
            // gifs,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          }
        );
      });
    } catch (error) {
      console.log(error);
      return new Response("Error fetching news", { status: 500, headers });
    }
  } else {
    console.log("Method not allowed");
    return new Response("Method not allowed", { status: 405, headers });
  }
});
