interface Props {
    width?: string;
    height?: string;
    mb?: string;
    roundCorners?: string;
    style?: string;
}
const Skeleton = ({width, height, roundCorners,mb,style}: Props) => {
    return (
        <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-900 ${width?width:'w-full'} ${height?height:'h-8'} ${roundCorners?roundCorners:'rounded-md'} ${mb?mb:''} ${style}`}/>
    )
}

export default Skeleton
