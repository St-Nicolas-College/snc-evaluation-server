import { factories } from "@strapi/strapi";
import { recalculatePortfolio } from "../../../utils/recalculate-portfolio";

const UID =
  "api::portfolio-entry.portfolio-entry";

type EntryStatus =
  | "draft"
  | "pending"
  | "for_verification"
  | "verified"
  | "rejected"
  | "needs_correction"
  | "expired";

type AuditStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "needs_correction"
  | "expired";

type TransitionStatus =
  | "for_verification"
  | "needs_correction"
  | "verified"
  | "rejected"
  | "draft"
  | "expired";

export default factories.createCoreService(
  UID,
  ({ strapi }) => ({
    async transition({
      entryDocumentId,
      user,
      nextStatus,
      remarks,
    }: {
      entryDocumentId: string;
      user: any;
      nextStatus: TransitionStatus;
      remarks?: string;
    }) {
      const entry: any = await strapi
        .documents(UID)
        .findOne({
          documentId: entryDocumentId,
          populate: {
            faculty_portfolio: {
              populate: {
                faculty: {
                  populate: {
                    user: true,
                    department: true,
                  },
                },
              },
            },
            evidence: true,
          },
        });

      if (!entry) {
        throw new Error(
          "Portfolio entry was not found.",
        );
      }

      const currentStatus =
        String(
          entry.verification_status ||
            "draft",
        ) as EntryStatus;

      validateTransition(
        currentStatus,
        nextStatus,
      );

      const roleName =
        String(
          user?.role?.name ||
          user?.role?.type ||
          "",
        );

      validateRole(
        roleName,
        nextStatus,
      );

      if (
        roleName === "Faculty" &&
        entry?.faculty_portfolio?.faculty
          ?.user?.id !== user.id
      ) {
        throw new Error(
          "You may update only your own portfolio entry.",
        );
      }

      if (
        roleName === "Dean" &&
        entry?.faculty_portfolio?.faculty
          ?.user?.id !== user.id &&
        nextStatus === "for_verification"
      ) {
        throw new Error(
          "You may submit only your own portfolio entries.",
        );
      }

      if (
        nextStatus ===
          "for_verification" &&
        !entry?.evidence?.length
      ) {
        throw new Error(
          "At least one evidence file is required before submission.",
        );
      }

      if (
        [
          "needs_correction",
          "rejected",
          "expired",
        ].includes(nextStatus) &&
        !String(remarks || "").trim()
      ) {
        throw new Error(
          "A review remark is required.",
        );
      }

      const now =
        new Date().toISOString();

      const updateData: any = {
        verification_status:
          nextStatus,
        is_locked: [
          "for_verification",
          "verified",
          "rejected",
          "expired",
        ].includes(nextStatus),
        remarks:
          remarks ??
          entry.remarks ??
          null,
      };

      if (nextStatus === "verified") {
        updateData.verified_at = now;
        updateData.verified_by =
          user.id;
      }

      if (
        nextStatus ===
          "needs_correction" ||
        nextStatus === "draft"
      ) {
        updateData.verified_at = null;
        updateData.verified_by = null;
      }

      const updated = await strapi
        .documents(UID)
        .update({
          documentId:
            entry.documentId,
          data: updateData,
        });

      const auditData: any = {
        verification_status:
          mapAuditStatus(
            nextStatus,
          ),
        previous_status:
          currentStatus,
        new_status:
          nextStatus,
        review_date: now,
        remarks:
          remarks || null,
        portfolio_entry:
          entry.documentId,
        reviewer:
          user.id,
      };

      await strapi
        .documents(
          "api::portfolio-verification.portfolio-verification",
        )
        .create({
          data: auditData,
        });

      const portfolioDocumentId =
        entry?.faculty_portfolio
          ?.documentId;

      if (portfolioDocumentId) {
        await recalculatePortfolio(
          strapi,
          portfolioDocumentId,
        );
      }

      return updated;
    },
  }),
);

function validateTransition(
  currentStatus: EntryStatus,
  nextStatus: TransitionStatus,
) {
  const allowed: Record<
    EntryStatus,
    TransitionStatus[]
  > = {
    draft: ["for_verification"],
    needs_correction: [
      "draft",
      "for_verification",
    ],
    for_verification: [
      "verified",
      "rejected",
      "needs_correction",
      "expired",
    ],
    pending: [
      "verified",
      "rejected",
      "needs_correction",
      "expired",
    ],
    verified: [
      "needs_correction",
      "expired",
    ],
    rejected: [
      "needs_correction",
    ],
    expired: [
      "needs_correction",
    ],
  };

  if (
    !allowed[currentStatus]?.includes(
      nextStatus,
    )
  ) {
    throw new Error(
      `Transition from ${currentStatus} to ${nextStatus} is not allowed.`,
    );
  }
}

function validateRole(
  roleName: string,
  nextStatus: TransitionStatus,
) {
  if (
    nextStatus ===
      "for_verification" &&
    !["Faculty", "Dean"].includes(
      roleName,
    )
  ) {
    throw new Error(
      "Only Faculty or Dean users may submit their own portfolio entries.",
    );
  }

  if (
    [
      "verified",
      "rejected",
      "needs_correction",
      "expired",
    ].includes(nextStatus) &&
    !["HR", "Admin"].includes(
      roleName,
    )
  ) {
    throw new Error(
      "Only HR or Admin users may review portfolio entries.",
    );
  }

  if (
    nextStatus === "draft" &&
    !["Faculty", "Dean"].includes(
      roleName,
    )
  ) {
    throw new Error(
      "Only Faculty or Dean users may return a corrected entry to draft.",
    );
  }
}

function mapAuditStatus(
  nextStatus: TransitionStatus,
): AuditStatus {
  if (
    nextStatus ===
    "for_verification"
  ) {
    return "pending";
  }

  if (nextStatus === "draft") {
    return "needs_correction";
  }

  return nextStatus as AuditStatus;
}
