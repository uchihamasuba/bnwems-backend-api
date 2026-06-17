import prisma from '../config/database';

export const surveyService = {
  async scheduleSurvey(payload: {
    orderId: number;
    leaderStaffId: number;
    surveyDate: string;
    locationNotes: string;
  }) {
    const survey = await prisma.survey.create({
      data: {
        orderId: payload.orderId,
        leaderStaffId: payload.leaderStaffId,
        surveyDate: new Date(payload.surveyDate),
        locationNotes: payload.locationNotes,
        status: 'ASSIGNED',
      },
    });

    await prisma.order.update({
      where: { id: payload.orderId },
      data: { status: 'PENDING_SURVEY' },
    });

    // Create notification for leader staff
    await prisma.notification.create({
      data: {
        userId: payload.leaderStaffId,
        title: 'Bạn được phân công khảo sát hiện trường',
        body: `Tác vụ khảo sát cho đơn hàng đã được giao vào ${new Date(payload.surveyDate).toLocaleDateString('vi-VN')}.`,
      },
    });

    return survey;
  },

  async submitSurveyReport(
    surveyId: number,
    payload: {
      surveyNotes: string;
      siteConditions: string;
      evidenceImages: string[];
    }
  ) {
    if (!payload.evidenceImages || payload.evidenceImages.length === 0) {
      const err: Error & { statusCode?: number } = new Error(
        'Hình ảnh hiện trường mặt bằng là điều kiện bắt buộc (BR-SV03).'
      );
      err.statusCode = 400;
      throw err;
    }

    const survey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        surveyNotes: payload.surveyNotes,
        siteConditions: payload.siteConditions,
        evidenceImages: payload.evidenceImages,
        status: 'COMPLETED',
        submittedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: survey.orderId },
      data: { status: 'SURVEYED' },
    });

    return survey;
  },
};
