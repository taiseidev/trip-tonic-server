/* eslint-disable */
import { UserRecord, Context, functions, admin } from '../firebase';

export const trigger = async (user: UserRecord, _: Context) => {
    const userId = user.uid;
    const customClaims = { IS_PREMIUM_MEMBER: false };

    try {
        // userにカスタムクレームを付与
        await admin.auth().setCustomUserClaims(userId, customClaims);
        functions.logger.info(`${userId}に無料会員のフラグが付与されました🚀`);
    } catch (error) {
        functions.logger.error(`error: ${error}`);
        throw new functions.auth.HttpsError(
            "unknown",
            String("error：" + error)
        );
    }
};
