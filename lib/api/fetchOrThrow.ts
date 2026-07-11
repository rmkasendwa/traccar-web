export type JsonResponse<T> = Omit<Response, 'json'> & {
  json: () => Promise<T>;
};

const fetchOrThrow = async <T = unknown>(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
): Promise<JsonResponse<T>> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response as JsonResponse<T>;
};

export default fetchOrThrow;
