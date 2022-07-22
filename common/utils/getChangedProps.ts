export function getChangedProps<
  NewProps extends Record<string, any>,
  OldProps extends Record<string, any>,
  CommonProps = OldProps & NewProps
>(newProps: NewProps, oldProps: OldProps) {
  const changedProps = {} as CommonProps;
  Object.keys(newProps).forEach((key) => {
    const newVal = newProps[key];
    const oldVal = oldProps[key];
    if (newVal !== oldVal) {
      changedProps[key as keyof CommonProps] = newVal;
    }
  });
  if (Object.keys(changedProps).length) {
    return changedProps;
  }
  return undefined;
}
