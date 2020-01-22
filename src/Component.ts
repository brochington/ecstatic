export interface Component<CT> {
  type: CT;
  storage: Map<any, any> | Set<any> | object;
}
