import { prisma } from '../config/database';

class ManagerService {
  public async getPendingApprovals() {
    const changeRequests = await prisma.changeRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' }
    });

    const surveyReports = await prisma.surveyReport.findMany({
      where: { status: 'submitted' },
      orderBy: { createdAt: 'desc' }
    });

    return {
      changeRequests: changeRequests.map(c => ({
        ...c,
        changeRequestId: c.changeRequestId.toString(),
        orderId: c.orderId.toString(),
        requestedBy: c.requestedBy.toString(),
        approvedBy: c.approvedBy?.toString(),
        reconciledBy: c.reconciledBy?.toString(),
      })),
      surveyReports: surveyReports.map(s => ({
        ...s,
        surveyReportId: s.surveyReportId.toString(),
        orderId: s.orderId.toString(),
        workTaskId: s.workTaskId?.toString(),
        recordedBy: s.recordedBy.toString(),
        reviewedBy: s.reviewedBy?.toString(),
      }))
    };
  }
}

export const managerService = new ManagerService();
