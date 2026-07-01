// @ts-nocheck
import { Skeleton, TableCell, TableRow } from '@/components/ui';

const TableShimmer = ({ columns, startAction, endAction, rows = 6, ref }) =>
  [...Array(rows)].map((_, rowIndex) => (
    <TableRow key={rowIndex} ref={rowIndex === 0 ? ref : null} aria-hidden="true">
      {[...Array(columns)].map((_, j) => {
        const action = (startAction && j === 0) || (endAction && j === columns - 1);
        return (
          <TableCell
            key={j}
            padding={action ? 'none' : 'normal'}
            className={action ? 'w-12 min-w-12' : 'min-w-36 py-3'}
          >
            {action ? (
              <Skeleton variant="circular" width={28} height={28} className="mx-auto" />
            ) : (
              <Skeleton
                height={14}
                className="max-w-full"
                width={`${58 + ((rowIndex + j) % 4) * 10}%`}
              />
            )}
          </TableCell>
        );
      })}
    </TableRow>
  ));

export default TableShimmer;
