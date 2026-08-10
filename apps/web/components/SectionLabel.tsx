interface SectionLabelProps {
  children: React.ReactNode;
  index?: string;
}

export function SectionLabel({ children, index }: SectionLabelProps) {
  return (
    <div className={`section-label${index ? '' : ' section-label-plain'}`}>
      {index ? (
        <>
          <span>{index}</span>
          <span aria-hidden>/</span>
        </>
      ) : null}
      <span>{children}</span>
    </div>
  );
}
