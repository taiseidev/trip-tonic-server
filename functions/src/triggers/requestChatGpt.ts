/* eslint-disable */
import * as dotenv from 'dotenv'
import axios from "axios";
import { functions } from '../firebase';

dotenv.config()
// const db = admin.firestore();

export const trigger = async (req: functions.https.Request, res: functions.Response<any>) => {
    const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;
    const location = req.query.location;
    const character = req.query.character;
    // const collectionRef = db.collection("words");
    // const words: any[] = [];

    try {
        // const querySnapshot = await collectionRef.get();
        // querySnapshot.forEach((doc) => {
        //     words.push({
        //         id: doc.id,
        //         word: doc.data()['word'],
        //     });
        // });

        // const collectionLength = await collectionRef.count().get();

        // const minInt = Math.ceil(1);
        // const maxInt = Math.floor(collectionLength.data().count);

        // const randomNum = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;

        // functions.logger.info(`🚀${words[randomNum].word}🚀`);

        const apiClient = axios.create({
            baseURL: "https://api.openai.com/v1/chat",
            responseType: "json",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        const response = await apiClient.post('/completions', {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "assistant",
                    "content": `# ゴール\nあなたは芥川賞や直木賞といった文学賞を受賞するほどの実力を持つ小説家です。\n与えられた情報を元に人を惹きつけるような短編小説を書いてください。なお、小説の舞台は${location}で、小説は起承転結の形式で作成してください。\n\n[登場人物]${character}（${character}がundefinedの場合は${location}に縁のある人物を登場人物として登場させてください。）\n\n[キーワード]エルデンリング\n[ジャンル]：純文学、大衆文学 、ミステリー小説、ハードボイルド小説 、恋愛小説 、青春小説 、官能小説 、BL小説 、SF小説 、ファンタジー小説 、ホラー小説 、ライトノベル、なろう系小説 、異世界転生小説 、時代・歴史小説 、ノンフィクション小説 、コメディ小説 \n[C1] = [ジャンル]の中から一つを選択し、[登場人物]を登場させ[キーワード]に沿った小説のタイトルを考えてください。\n[C2] = [C1]のタイトルから想像を膨らませ、で短編小説の本文を完成させてください。なお、文章は必ず完結させ文章量は3000字前後で出力してください。\n\n> Run commands [C1] [C2]\n`,
                }
            ]
        });

        res.status(200).send(response.data);
    } catch (error: any) {
        console.error("Error: ", error);
        res.status(500).send("Error: " + error.message);
    }
};
