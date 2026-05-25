import { $fetch } from 'ofetch';

interface SubmissionValue {
  field: string;
  value?: string | null;
  file?: string | null;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid form submission',
    });
  }

  const payloadUrl = config.public.payloadUrl as string | undefined;

  if (!payloadUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'PAYLOAD_URL is not defined. Check your .env file.',
    });
  }

  try {
    const submissionValues: SubmissionValue[] = [];
    let formId = '';
    let fields = [];

    for (const field of formData) {
      if (field.name === 'formId') {
        formId = field.data.toString();
      } else if (field.name === 'fields') {
        fields = JSON.parse(field.data.toString());
      }
    }

    for (const field of formData) {
      if (!field.name || !field.data) continue;
      if (field.name === 'formId' || field.name === 'fields') continue;

      const matchingField = fields.find((f: { name: string | undefined }) => f.name === field.name);
      if (!matchingField) continue;

      if (field.filename) {
        // Upload file to Payload
        const blob = new Blob([field.data as BlobPart], { type: field.type });

        const uploadFormData = new FormData();
        uploadFormData.append('file', blob, field.filename);

        // Payload file upload endpoint
        const uploadedFile = await $fetch<{
          id?: string;
        }>(`${payloadUrl}/api/media`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadedFile?.id) {
          submissionValues.push({
            field: matchingField.id,
            file: uploadedFile.id,
          });
        }
      } else {
        submissionValues.push({
          field: matchingField.id,
          value: field.data.toString(),
        });
      }
    }

    // Note: Payload forms system implementation
    // You may need to create a form_submissions collection in Payload
    // or handle form submissions differently
    const payload = {
      form: formId,
      values: submissionValues as Array<{
        field: string;
        value?: string | null;
        file?: string | null;
      }>,
    };

    // If you have a form_submissions collection in Payload:
    // await createItem('form-submissions', payload);

    // For now, just log the submission
    console.warn('Form submission:', payload);

    return { success: true };
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
