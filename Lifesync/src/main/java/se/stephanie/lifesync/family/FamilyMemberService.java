package se.stephanie.lifesync.family;


import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;


@Service
public class FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;

    public FamilyMemberService(FamilyMemberRepository familyMemberRepository) {
        this.familyMemberRepository = familyMemberRepository;
    }

        /* GET */
    public List<FamilyMember> getAllFamilyMembers() {
        return familyMemberRepository.findAll();
    }

    public FamilyMember getFamilyMemberByName(@PathVariable String name) {
        return familyMemberRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Family member not found: " + name));
    }

        /* POST */

    public FamilyMember createFamilyMember(@RequestBody FamilyMember familyMember) {
        return familyMemberRepository.save(familyMember);
    }

    /* PUT */

    public FamilyMember updateFamilyMember(Long id, FamilyMember updatedMember) {

        FamilyMember existingMember = familyMemberRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Family member not found with id: " + id));

        existingMember.setName(updatedMember.getName());
        existingMember.setRelation(updatedMember.getRelation());
        existingMember.setBirthDate(updatedMember.getBirthDate());
        existingMember.setColor(updatedMember.getColor());
        existingMember.setActive(updatedMember.isActive());

        return familyMemberRepository.save(existingMember);
    }

    /* DELETE */

    public void deleteFamilyMember(Long id) {
        familyMemberRepository.deleteById(id);
    }

}
