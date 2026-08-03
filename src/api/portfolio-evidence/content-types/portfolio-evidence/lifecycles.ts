export default {
  async beforeCreate(event: any) {
    validateEvidenceDates(
      event.params.data,
    );
  },

  async beforeUpdate(event: any) {
    validateEvidenceDates(
      event.params.data,
    );
  },
};

function validateEvidenceDates(
  data: any,
) {
  const issueDate =
    data?.issue_date;

  const expirationDate =
    data?.expiration_date;

  if (
    issueDate &&
    expirationDate &&
    new Date(expirationDate) <
      new Date(issueDate)
  ) {
    throw new Error(
      "Evidence expiration date cannot be earlier than its issue date.",
    );
  }
}
