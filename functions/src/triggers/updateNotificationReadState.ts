/* eslint-disable */
import { CallableContext, admin, functions } from '../firebase';


// お知らせの既読状態を更新する
export const trigger = async (snapshot: any, _: CallableContext) => {
    const userId: string = snapshot.userId;
    const notificationId: string = snapshot.notificationId;
    const version: string = snapshot.version;

    console.info(`🚀userId: ${userId}`);
    console.info(`🚀notificationId: ${notificationId}`);
    console.info(`🚀version: ${version}`);
    try {
        // お知らせのリファレンス
        const docRef = admin.firestore().doc(`versions/${version}/users/${userId}/notifications/${notificationId}`);

        // 既読状態を更新する
        await docRef.update({
            'isRead': true,
        });
        console.log('お知らせの既読状態を更新しました！');
    } catch (error) {
        functions.logger.error(`error: ${error}`);
        throw new functions.auth.HttpsError(
            "unknown",
            String("error：" + error)
        );
    }
};
