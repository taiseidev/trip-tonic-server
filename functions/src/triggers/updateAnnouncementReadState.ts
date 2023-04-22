/* eslint-disable */
import { CallableContext, admin, functions } from '../firebase';


// 運営からのお知らせの既読状態を更新する
// updateと命名しているが、処理の実態はaddを行なっている。
// 運営からのお知らせはドキュメントを追加することで既読かどうかの判定を行なっている
export const trigger = async (snapshot: any, _: CallableContext) => {
    const userId: string = snapshot.userId;
    const announcementId: string = snapshot.announcementId;
    const version: string = snapshot.version;

    console.info(`🚀userId: ${userId}`);
    console.info(`🚀announcementId: ${announcementId}`);
    console.info(`🚀version: ${version}`);
    try {
        // 運営からのお知らせのリファレンス
        const collectionRef = admin.firestore().collection(`versions/${version}/users/${userId}/readAnnouncements`);

        // 既読状態を更新する
        await collectionRef.add({
            'announcementId': announcementId,
            'createdAt': admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('運営からのお知らせの既読状態を更新しました！');
    } catch (error) {
        functions.logger.error(`error: ${error}`);
        throw new functions.auth.HttpsError(
            "unknown",
            String("error：" + error)
        );
    }
};
