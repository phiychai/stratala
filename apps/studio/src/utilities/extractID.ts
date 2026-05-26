export const extractID = <T extends { id: unknown }>(objectOrID: T | T['id']): T['id'] => {
  if (objectOrID && typeof objectOrID === 'object' && 'id' in objectOrID) {
    return (objectOrID as T).id
  }

  return objectOrID
}
