import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { selectEco } from '../store/slices/ui'

const ECODisplay = () => {
  const eco = useSelector((state: RootState) => selectEco(state));
  
  return (
    <div className='h-8 flex items-center'>
      <p className='text-xs leading-none'>
        <span>{eco?.eco}</span>
        {eco ? ': ' : ''}
        <span>{eco?.name}</span>
      </p>
    </div>
  );
}

export default ECODisplay;
