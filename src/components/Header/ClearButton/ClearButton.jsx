export function ClearButton({setSelectedImage, setClear}) {
    return (
        <>
            <button
                className="clear-button"
                onClick={() => {
                    setSelectedImage(null);
                    setClear(true)
                }}
            >
                Clear
            </button>
        </>
    )
}