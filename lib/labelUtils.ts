import { Folder } from "./mockData";

export const LABEL_COLOR_PRESETS = [
  { colorText: "var(--label-yellow-text)", colorBg: "var(--label-yellow-bg)" },
  { colorText: "var(--label-red-text)", colorBg: "var(--label-red-bg)" },
  { colorText: "var(--label-green-text)", colorBg: "var(--label-green-bg)" },
  { colorText: "var(--label-blue-text)", colorBg: "var(--label-blue-bg)" },
  { colorText: "var(--label-pink-text)", colorBg: "var(--label-pink-bg)" },
  { colorText: "var(--label-purple-text)", colorBg: "var(--label-purple-bg)" },
  { colorText: "var(--label-gray-text)", colorBg: "var(--label-gray-bg)" },
  { colorText: "var(--label-teal-text)", colorBg: "var(--label-teal-bg)" },
] as const;

export function flattenLabels(labels: Folder[]): Folder[] {
  const result: Folder[] = [];
  for (const label of labels) {
    result.push(label);
    if (label.children?.length) {
      result.push(...flattenLabels(label.children));
    }
  }
  return result;
}

export function findLabelById(labels: Folder[], id: string): Folder | null {
  for (const label of labels) {
    if (label.id === id) return label;
    if (label.children?.length) {
      const found = findLabelById(label.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getLabelPath(labels: Folder[], id: string, parents: string[] = []): string | null {
  for (const label of labels) {
    const path = [...parents, label.name];
    if (label.id === id) return path.join("/");
    if (label.children?.length) {
      const found = getLabelPath(label.children, id, path);
      if (found) return found;
    }
  }
  return null;
}

export function getLabelDescendantIds(label: Folder): string[] {
  const ids = [label.id];
  for (const child of label.children || []) {
    ids.push(...getLabelDescendantIds(child));
  }
  return ids;
}

export function isLabelId(labels: Folder[], id: string): boolean {
  return findLabelById(labels, id) !== null;
}

export function withUpdatedLabelCounts(labels: Folder[], tagIdsByEmail: string[][]): Folder[] {
  const counts = new Map<string, number>();
  for (const tagIds of tagIdsByEmail) {
    for (const tagId of tagIds) {
      counts.set(tagId, (counts.get(tagId) || 0) + 1);
    }
  }

  const mapLabel = (label: Folder): Folder => ({
    ...label,
    count: counts.get(label.id) || 0,
    children: label.children?.map(mapLabel),
  });

  return labels.map(mapLabel);
}
