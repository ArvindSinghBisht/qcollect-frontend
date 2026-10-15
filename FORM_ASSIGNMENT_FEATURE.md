# Project Admin Form Assignment

Project Admins can now assign each form to an Accessor and a Quality Checker from the project forms screen.

## API calls

- `GET /projects/{projectId}/members`
- `GET /forms/{formId}/assignments`
- `POST /forms/{formId}/assignments?projectId={projectId}`

POST body:

```json
{
  "accessorId": "USER_UUID",
  "qualityCheckerId": "USER_UUID"
}
```

## Changed files

- `components/form/AssignFormDialog.tsx` (new)
- `components/form/FormsTable.tsx`
- `services/form.service.ts`
- `services/project.service.ts`
- `types/form.ts`
- `app/projects/[projectId]/forms/page.tsx`
- `app/projects/[projectId]/page.tsx`
