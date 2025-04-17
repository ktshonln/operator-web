function Ticket() {
    return (
        <div className="bg-neutral-100 p-3 text-xs w-60">
             <div className="w-fit mx-auto">
            <img
              src="/logoOne.svg"
              className="w-16"
              alt="Katisha-logo"
            />
            </div>
            <div>
                <p>Kigali - Nyamagabe</p>
                <hr className="border border-dashed "/>
                <p>Name: <span>John Doe</span></p>
            </div>
        </div>
    )
}

export default Ticket
