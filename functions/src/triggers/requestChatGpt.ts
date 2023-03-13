/* eslint-disable */
import { functions } from '../firebase';
import * as dotenv from 'dotenv'
dotenv.config()
import axios from "axios";;


// TODO: エラーハンドリングを追加する
export const trigger = async (req: functions.https.Request, res: functions.Response<any>) => {
    const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;
    const content = req.query.content;
    functions.logger.info(`🚀${content}🚀`);

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
                "role": "user",
                "content": content,
            }
        ]
    });

    res.status(200).send(response.data);
};
