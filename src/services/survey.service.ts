import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class SurveyService {
  static async scheduleSurvey(orderId: string, data: any, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: BigInt(orderId) } });
    if (!order) throw new AppError('Order not found', 404);

    const surveyedBy = data.surveyed_by ? BigInt(data.surveyed_by) : BigInt(userId); // Default to creator if not provided

    const survey = await prisma.surveyReport.create({
      data: {
        orderId: BigInt(orderId),
        surveyedBy: surveyedBy,
        surveyDate: new Date(data.survey_date),
        status: 'draft'
      }
    });

    return {
      id: Number(survey.id),
      order_id: Number(survey.orderId),
      survey_date: survey.surveyDate,
      surveyed_by: survey.surveyedBy ? Number(survey.surveyedBy) : null,
      status: survey.status
    };
  }

  static async getSurveysByOrder(orderId: string) {
    const surveys = await prisma.surveyReport.findMany({
      where: { orderId: BigInt(orderId) }
    });
    return surveys.map(s => ({
      id: Number(s.id),
      order_id: Number(s.orderId),
      survey_date: s.surveyDate,
      surveyed_by: s.surveyedBy ? Number(s.surveyedBy) : null,
      status: s.status
    }));
  }

  static async getSurveyReportById(id: string) {
    const survey = await prisma.surveyReport.findUnique({
      where: { id: BigInt(id) },
      include: { items: true }
    });
    if (!survey) throw new AppError('Survey not found', 404);

    const attachments = await prisma.evidenceAttachment.findMany({
      where: { entityType: 'survey_reports', entityId: BigInt(id) },
      include: { evidenceFile: true }
    });

    return {
      id: Number(survey.id),
      order_id: Number(survey.orderId),
      surveyed_by: survey.surveyedBy ? Number(survey.surveyedBy) : null,
      survey_date: survey.surveyDate,
      venue_notes: survey.venueNotes,
      requirement_notes: survey.requirementNotes,
      status: survey.status,
      items: survey.items.map((i: any) => ({
        id: Number(i.id),
        catalog_item_id: i.catalogItemId ? Number(i.catalogItemId) : null,
        item_name: i.itemName,
        quantity_required: Number(i.quantityRequired),
        notes: i.notes
      })),
      evidence_files: attachments.map((a: any) => ({
        id: Number(a.evidenceFile.id),
        file_url: a.evidenceFile.fileUrl
      }))
    };
  }

  static async assignSurvey(id: string, data: any) {
    const survey = await prisma.surveyReport.update({
      where: { id: BigInt(id) },
      data: { surveyedBy: BigInt(data.surveyed_by) }
    });
    return { id: Number(survey.id), surveyed_by: Number(survey.surveyedBy) };
  }

  static async updateSurveyReport(id: string, data: any, userId: string) {
    const survey = await prisma.surveyReport.findUnique({ where: { id: BigInt(id) } });
    if (!survey) throw new AppError('Survey not found', 404);

    const updated = await prisma.surveyReport.update({
      where: { id: BigInt(id) },
      data: {
        venueNotes: data.venue_notes || undefined,
        requirementNotes: data.requirement_notes || undefined
      }
    });

    if (data.items) {
      await prisma.surveyItem.deleteMany({ where: { surveyReportId: BigInt(id) } });
      await prisma.surveyItem.createMany({
        data: data.items.map((i: any) => ({
          surveyReportId: BigInt(id),
          catalogItemId: i.catalog_item_id ? BigInt(i.catalog_item_id) : null,
          itemName: i.item_name || 'N/A',
          quantityRequired: i.quantity_required,
          notes: i.notes || null
        }))
      });
    }

    if (data.evidence_file_ids && data.evidence_file_ids.length > 0) {
      const fileIds = data.evidence_file_ids.map((fid: any) => BigInt(fid));
      await prisma.evidenceAttachment.updateMany({
        where: { id: { in: fileIds } },
        data: {
          entityType: 'survey_reports',
          entityId: BigInt(id)
        }
      });
    }

    return { id: Number(updated.id) };
  }

  static async submitSurveyReport(id: string, userId: string) {
    const survey = await prisma.surveyReport.findUnique({ where: { id: BigInt(id) } });
    if (!survey) throw new AppError('Survey not found', 404);
    if (survey.surveyedBy && survey.surveyedBy !== BigInt(userId)) {
      // In reality, might need role check if Admin can override
    }

    const updated = await prisma.surveyReport.update({
      where: { id: BigInt(id) },
      data: { status: 'submitted' }
    });

    return { id: Number(updated.id), status: updated.status };
  }
}