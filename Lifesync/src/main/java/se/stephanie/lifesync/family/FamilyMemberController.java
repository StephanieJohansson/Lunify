package se.stephanie.lifesync.family;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family")
public class FamilyMemberController {

    private final FamilyMemberService service;

    public FamilyMemberController(FamilyMemberService service) {
        this.service = service;
    }

     /* GET */
    @GetMapping
    public List<FamilyMember> getAllFamilyMembers() {
        return service.getAllFamilyMembers();
    }

    @GetMapping("/name/{name}")
    public FamilyMember getFamilyMemberByName(@PathVariable String name) {
        return service.getFamilyMemberByName(name);
    }

     /* POST */
    @PostMapping
    public FamilyMember createFamilyMember(@Valid @RequestBody FamilyMember familyMember) {
        return service.createFamilyMember(familyMember);
    }

     /* PUT */
    @PutMapping("/{id}")
    public FamilyMember updateFamilyMember(@PathVariable Long id, @Valid @RequestBody FamilyMember updatedMember) {
        return service.updateFamilyMember(id, updatedMember);
    }

     /* DELETE */
    @DeleteMapping("/{id}")
    public void deleteFamilyMember(@PathVariable Long id) {
        service.deleteFamilyMember(id);
    }
}
