import { Method } from "@/method/method";

// Collection of API methods with iterator support
export class MethodsCollection implements Iterable<Method> {
  private methods: Method[] = [];

  add(method: Method): void {
    this.methods.push(method);
  }

  getAll(): Method[] {
    return [...this.methods];
  }

  count(): number {
    return this.methods.length;
  }

  // Iterator implementation
  [Symbol.iterator](): Iterator<Method> {
    let index = 0;
    const methods = this.methods;

    return {
      next(): IteratorResult<Method> {
        if (index < methods.length) {
          return {
            value: methods[index++],
            done: false,
          };
        } else {
          return {
            value: undefined as any,
            done: true,
          };
        }
      },
    };
  }
}
